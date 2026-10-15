// -----------------------------------------------------------------------------
// The heart of the integration: the season read from Jolpica-F1 and kept in a
// cache in /data, and the clock that turns it into device states and scene
// events.
//
// The clock ticks every minute (Gladys never polls the device, should_poll is
// false):
// - it reads again what is due: the calendar once a day, results and
//   standings every 6 hours, and every 10 minutes from 90 minutes after a race
//   start until its results and standings are published (48 hours at most);
// - it publishes the states that changed, and every state twice a day
//   (Gladys flags a value older than 48 hours as "no recent value", and the
//   leader of the championship stays the same for weeks);
// - it fires "session starting" at each lead time the scene filters offer,
//   and "race finished" when the results of a new race appear.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';
import { buildDevice, buildStates, podiumText } from './device.js';
import { createFailureLog } from './failures.js';
import { PROBLEM_TEXT, SENTENCES, SESSION_NAMES, inEveryLanguage } from './i18n.js';
import { PARSERS, PATHS } from './jolpica.js';
import { favorites, lastStartedRace, nextRace, nextSession, raceRunning } from './season.js';
import { formatTime, processTimeZone } from './time.js';

const logger = createLogger({ name: 'f1' });

export const WIDGET_KEY = 'f1';

// Trigger keys are forever: scenes store them.
export const TRIGGERS = {
  SESSION_STARTING: 'session_starting',
  RACE_FINISHED: 'race_finished',
};

// The lead times the "session starting" filter offers, in minutes.
export const LEAD_MINUTES = [0, 5, 15, 30, 60, 120];

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const MAX_AGE = {
  schedule: 24 * HOUR,
  results: 6 * HOUR,
  drivers: 6 * HOUR,
  constructors: 6 * HOUR,
};
const RETRY_AFTER = 10 * MINUTE;
// Jolpica-F1 publishes the results some time after the chequered flag.
const RESULTS_EXPECTED_AFTER = 90 * MINUTE;
const RESULTS_WATCH = 48 * HOUR;
const RESULTS_INTERVAL = 10 * MINUTE;
const HEARTBEAT = 12 * HOUR;
// After a restart, the triggers of the last minutes are still fired.
const CATCH_UP = 10 * MINUTE;
// "Race finished" is only fired for a race of the last days (not for the last
// race of the season when the integration is installed in winter).
const ANNOUNCE_WITHIN = 3 * 24 * HOUR;

const CACHE_FILE = 'cache.json';
const TRIGGERS_FILE = 'triggers.json';

export class F1Service {
  /**
   * @param {object} options
   * @param {object} options.gladys the SDK client
   * @param {object} options.store JSON files in /data (src/store.js)
   * @param {object} options.api the Jolpica-F1 client (src/jolpica.js)
   * @param {Function} [options.now] the clock (tests)
   * @param {string} [options.timeZone] Gladys' time zone (default: TZ)
   * @param {boolean} [options.timers] false in the tests: they call tick()
   */
  constructor({ gladys, store, api, now = Date.now, timeZone, timers = true }) {
    this.gladys = gladys;
    this.store = store;
    this.api = api;
    this.now = now;
    this.timeZone = timeZone ?? processTimeZone();
    this.timers = timers;
    this.config = null;
    this.data = { schedule: null, results: null, drivers: null, constructors: null };
    this.fetchedAt = {};
    this.apiError = null;
    this.lastAttempt = 0;
    this.lastCheck = 0;
    this.announced = null;
    this.lastForce = 0;
    this.statusKey = null;
    this.widgetKey = null;
    this.timer = null;
    this.queue = Promise.resolve();
    // A failure repeated every minute is logged once (src/failures.js).
    this.failures = createFailureLog(logger);
  }

  // One operation at a time: a tick never interleaves with a reconfiguration.
  serial(fn) {
    const run = this.queue.then(fn);
    this.queue = run.catch(() => {});
    return run;
  }

  start(config) {
    return this.serial(async () => {
      this.config = config;
      this.loadCache();
      const saved = this.store.load(TRIGGERS_FILE) ?? {};
      this.announced = saved.announced ?? null;
      const now = this.now();
      this.lastCheck = Math.max(saved.lastCheck ?? 0, now - CATCH_UP);
      await this.refresh();
      await this.publishDevice();
      await this.publishStates({ force: true });
      await this.updateStatus();
      this.refreshWidget();
      await this.fireSessionTriggers();
      this.schedule();
    });
  }

  /** The configuration changed (language, favorites): maybe new features. */
  reconfigure(config) {
    return this.serial(async () => {
      this.config = config;
      await this.publishDevice();
      await this.publishStates({ force: true });
      await this.updateStatus({ force: true });
      this.refreshWidget();
    });
  }

  /** Gladys came back (restart): it may have lost what was sent meanwhile. */
  resync(config) {
    return this.reconfigure(config);
  }

  /** The user added the device: its states were dropped until now. */
  deviceCreated() {
    return this.serial(async () => {
      await this.publishStates({ force: true });
      this.refreshWidget();
    });
  }

  /** "Check" on the Configuration screen: everything read again now. */
  check() {
    return this.serial(async () => {
      const ok = await this.refresh({ force: true });
      await this.publishStates();
      await this.updateStatus();
      this.refreshWidget();
      return ok;
    });
  }

  stop() {
    clearTimeout(this.timer);
    this.timer = null;
    return this.queue;
  }

  schedule() {
    if (!this.timers) {
      return;
    }
    clearTimeout(this.timer);
    // Just after the next minute: a session starting at :00 is seen at :00.
    const delay = MINUTE - (this.now() % MINUTE) + 500;
    this.timer = setTimeout(() => {
      this.tick()
        .then(() => this.failures.succeeded('tick', 'The clock works again'))
        .catch((err) => this.failures.failed('tick', 'Clock tick failed', err))
        .finally(() => this.schedule());
    }, delay);
    this.timer.unref?.();
  }

  /** One step of the clock. */
  tick() {
    return this.serial(async () => {
      if (await this.refresh()) {
        await this.updateStatus();
      }
      await this.publishStates({ force: this.now() - this.lastForce >= HEARTBEAT });
      await this.fireSessionTriggers();
      // The countdown and the past sessions of the widget follow the clock.
      if (this.widgetSignature() !== this.widgetKey) {
        this.refreshWidget();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Jolpica-F1 and its cache
  // ---------------------------------------------------------------------------

  loadCache() {
    const cache = this.store.load(CACHE_FILE);
    if (cache?.version !== 1) {
      return;
    }
    for (const key of Object.keys(PATHS)) {
      if (cache.documents?.[key]) {
        this.data[key] = cache.documents[key].data;
        this.fetchedAt[key] = cache.documents[key].fetched_at;
      }
    }
  }

  saveCache() {
    const documents = {};
    for (const key of Object.keys(PATHS)) {
      if (this.fetchedAt[key]) {
        documents[key] = { fetched_at: this.fetchedAt[key], data: this.data[key] };
      }
    }
    this.store.save(CACHE_FILE, { version: 1, documents });
  }

  /** Is a document due? Results and standings are watched after a race. */
  isDue(key, now) {
    const fetched = this.fetchedAt[key];
    if (!fetched) {
      return true;
    }
    const age = now - fetched;
    if (age >= MAX_AGE[key]) {
      return true;
    }
    if (key === 'schedule' || age < RESULTS_INTERVAL) {
      return false;
    }
    const race = lastStartedRace(this.data.schedule, now);
    if (!race || now < race.start + RESULTS_EXPECTED_AFTER || now > race.start + RESULTS_WATCH) {
      return false;
    }
    const document = this.data[key];
    return !document || document.season !== race.season || document.round < race.round;
  }

  /**
   * Reads the documents that are due (all of them with `force`).
   * @returns {Promise<boolean>} true when something was read or failed: the
   *   connection status may have changed
   */
  async refresh({ force = false } = {}) {
    const now = this.now();
    if (!force && this.apiError && now - this.lastAttempt < RETRY_AFTER) {
      return false;
    }
    const due = Object.keys(PATHS).filter((key) => force || this.isDue(key, now));
    if (due.length === 0) {
      return false;
    }
    this.lastAttempt = now;
    const previousResults = this.data.results;
    let read = 0;
    try {
      for (const key of due) {
        this.data[key] = PARSERS[key](await this.api.get(PATHS[key]));
        this.fetchedAt[key] = now;
        read += 1;
      }
      this.apiError = null;
      this.failures.succeeded('api', 'Jolpica-F1 read again');
    } catch (err) {
      this.apiError = err.message;
      this.failures.failed('api', `Could not read Jolpica-F1: ${err.message}`);
    }
    if (read > 0) {
      this.saveCache();
      logger.debug(`Read ${due.slice(0, read).join(', ')} from Jolpica-F1`);
    }
    if (this.data.results !== previousResults) {
      await this.announceResults(now);
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Gladys side
  // ---------------------------------------------------------------------------

  async publishDevice() {
    await this.gladys.publishDiscoveredDevices([buildDevice(this.gladys, this.config)]);
  }

  /**
   * Publishes the states that changed, or all of them (`force`). A failure is
   * logged: the next publication sends again what Gladys did not accept.
   */
  async publishStates({ force = false } = {}) {
    if (force) {
      this.gladys.forgetPublishedStates();
      this.lastForce = this.now();
    }
    const states = buildStates(this.gladys, this.config, this.data, {
      now: this.now(),
      timeZone: this.timeZone,
    });
    try {
      await this.gladys.publishChangedStates(states);
      this.failures.succeeded('states', 'States published again');
    } catch (err) {
      this.failures.failed('states', `Could not publish the states: ${err.message}`);
    }
  }

  /** Problems shown in the connection status: { key, value } (texts in PROBLEM_TEXT). */
  problems() {
    const found = [];
    if (this.apiError) {
      found.push({ key: 'unreachable' });
    }
    const fav = favorites(this.config, this.data);
    if (fav.driver?.unknown && this.data.drivers) {
      found.push({ key: 'driverUnknown', value: fav.driver.unknown });
    }
    if (fav.team?.unknown && this.data.constructors) {
      found.push({ key: 'teamUnknown', value: fav.team.unknown });
    }
    return found;
  }

  /** Reports the status when it changed (or always, with `force`). */
  async updateStatus({ force = false } = {}) {
    const problems = this.problems();
    const key = JSON.stringify(problems);
    if (!force && key === this.statusKey) {
      return;
    }
    const message =
      problems.length === 0
        ? undefined
        : inEveryLanguage(PROBLEM_TEXT, (text) =>
            problems.map(({ key: problem, value }) => text[problem](value)).join(' '),
          );
    try {
      await this.gladys.setConnectionStatus(problems.length === 0, message);
      this.statusKey = key;
      this.failures.succeeded('status', 'Status reported again');
    } catch (err) {
      this.failures.failed('status', `Could not report the status: ${err.message}`);
    }
  }

  widgetSignature() {
    const now = this.now();
    const race = nextRace(this.data.schedule, now);
    return [
      race?.round,
      nextSession(race, now)?.key,
      raceRunning(race, now),
      // The countdown tile shows hours, minutes under a day.
      race ? Math.floor((race.start - now) / (race.start - now < 24 * HOUR ? MINUTE : HOUR)) : 0,
      ...Object.values(this.fetchedAt),
    ].join('|');
  }

  refreshWidget() {
    this.widgetKey = this.widgetSignature();
    try {
      // Fire-and-forget, rate-limited by the core: never awaited.
      Promise.resolve(this.gladys.requestWidgetRefresh(WIDGET_KEY)).catch(() => {});
    } catch {
      // Disconnected: the widget refetches on its own TTL.
    }
  }

  async fireEvent(key, data) {
    try {
      await this.gladys.publishSceneEvent(key, data);
      this.failures.succeeded('scene-event', 'Scene triggers fired again');
    } catch (err) {
      this.failures.failed('scene-event', `Could not fire ${key}: ${err.message}`);
    }
  }

  /** "Session starting": every (session, lead time) reached since the last check. */
  async fireSessionTriggers() {
    const now = this.now();
    const from = this.lastCheck;
    this.lastCheck = now;
    const language = this.config.language;
    const events = [];
    for (const race of this.data.schedule?.races ?? []) {
      for (const session of race.sessions) {
        if (!session.timed) {
          continue;
        }
        for (const lead of LEAD_MINUTES) {
          const at = session.start - lead * MINUTE;
          if (at > from && at <= now) {
            events.push({
              at,
              data: {
                session: session.key,
                minutes_before: lead,
                session_name: SESSION_NAMES[language][session.key],
                grand_prix: race.name,
                circuit: race.circuit.name,
                round: race.round,
                start_time: formatTime(session.start, language, this.timeZone),
              },
            });
          }
        }
      }
    }
    if (events.length === 0) {
      return;
    }
    events.sort((a, b) => a.at - b.at);
    for (const event of events) {
      await this.fireEvent(TRIGGERS.SESSION_STARTING, event.data);
    }
    this.saveTriggers();
  }

  saveTriggers() {
    this.store.save(TRIGGERS_FILE, { lastCheck: this.lastCheck, announced: this.announced });
  }

  /** New results: "race finished", once per race, for a race of the last days. */
  async announceResults(now) {
    const results = this.data.results;
    if (!results) {
      return;
    }
    const key = `${results.season}-${results.round}`;
    if (key === this.announced) {
      return;
    }
    const first = this.announced === null;
    this.announced = key;
    this.saveTriggers();
    const race = this.data.schedule?.races.find(
      (entry) => entry.season === results.season && entry.round === results.round,
    );
    const start = race?.start ?? Date.parse(`${results.date}T12:00:00Z`);
    if (first || now - start > ANNOUNCE_WITHIN) {
      return;
    }
    await this.fireEvent(TRIGGERS.RACE_FINISHED, this.raceFinishedData());
  }

  raceFinishedData() {
    const results = this.data.results;
    const language = this.config.language;
    const sentences = SENTENCES[language];
    const podium = results.results
      .slice(0, 3)
      .map((row) => ({ name: row.driver.name, team: row.team.name }));
    const fav = favorites(this.config, this.data);
    let summary = sentences.raceFinished(results.name, podium);
    if (fav.driver?.driver && fav.driver.lastResult !== null && fav.driver.lastResult !== 1) {
      summary += sentences.favoriteFinished(fav.driver.driver.name, fav.driver.lastResult);
    }
    return {
      grand_prix: results.name,
      round: results.round,
      winner: results.results[0].driver.name,
      winner_team: results.results[0].team.name,
      podium: podiumText(results),
      favorite_driver_position: fav.driver?.lastResult ?? 0,
      favorite_team_position: fav.team?.lastResult ?? 0,
      summary,
    };
  }
}
