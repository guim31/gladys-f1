// -----------------------------------------------------------------------------
// Registers every SDK handler on a GladysIntegration (or the SDK's fake Gladys
// in the tests) and returns the service, so index.js stays a few lines and the
// tests drive the very same wiring.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';
import { normalizeConfig } from './config.js';
import { CHECK_TEXT, INIT_FAILED } from './i18n.js';
import { createJolpica } from './jolpica.js';
import { SCENE_ACTIONS, nextRaceSummary } from './scenes.js';
import { F1Service } from './service.js';
import { favorites, hasCalendar, knownDrivers, knownTeams } from './season.js';
import { createStore } from './store.js';
import { WIDGETS } from './widgets.js';

const logger = createLogger({ name: 'f1-app' });

export const CHECK_ACTION = 'check';

/**
 * @param {object} gladys GladysIntegration instance
 * @param {object} [options] test seams: store, fetch, now, timeZone, timers
 */
export function registerHandlers(gladys, options = {}) {
  const service = new F1Service({
    gladys,
    store: options.store ?? createStore(),
    api: options.api ?? createJolpica({ fetch: options.fetch, sleep: options.sleep }),
    now: options.now,
    timeZone: options.timeZone,
    timers: options.timers ?? true,
  });

  // Resolved once the service has started; every handler waits for it.
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  let started = false;
  const whenReady =
    (fn) =>
    async (...args) => {
      await ready;
      return fn(...args);
    };

  gladys.on('connected', async () => {
    try {
      const config = normalizeConfig(await gladys.getConfig());
      if (started) {
        await service.resync(config);
        return;
      }
      started = true;
      await service.start(config);
    } catch (err) {
      logger.error('Initialization failed', err);
      // The handlers keep answering, with the defaults if need be.
      service.config ??= normalizeConfig({});
      await gladys.setConnectionStatus(false, INIT_FAILED).catch(() => {});
      // The next status report replaces this one.
      service.statusKey = null;
    } finally {
      resolveReady();
    }
  });

  gladys.onScanRequest(whenReady(() => service.publishDevice()));

  gladys.onDeviceCreated(whenReady(() => service.deviceCreated()));

  gladys.onConfigUpdated(whenReady((config) => service.reconfigure(normalizeConfig(config))));

  gladys.onAction(
    CHECK_ACTION,
    whenReady(async () => {
      logger.info('Action "check": reading Jolpica-F1 again');
      await service.check();
      return checkMessage(service);
    }),
  );

  for (const [key, handler] of Object.entries(SCENE_ACTIONS)) {
    gladys.onSceneAction(
      key,
      whenReady((fields) => handler(service, { fields })),
    );
  }

  for (const [key, widget] of Object.entries(WIDGETS)) {
    gladys.onWidgetGet(
      key,
      whenReady((request) => widget.get(service, request)),
    );
  }

  return { service, ready, stop: () => service.stop() };
}

/** The report of "Check", one text per language. */
export function checkMessage(service) {
  return Object.fromEntries(
    Object.entries(CHECK_TEXT).map(([language, text]) => [
      language,
      checkReport(service, text, language),
    ]),
  );
}

function checkReport(service, text, language) {
  const { data } = service;
  const lines = [];
  if (hasCalendar(data.schedule)) {
    lines.push(text.season(data.schedule.season, data.schedule.races.length));
  }
  lines.push(text.next(nextRaceSummary(service, language).sentence));
  if (data.results) {
    lines.push(text.last(data.results.name, data.results.results[0].driver.name));
  }
  const fav = favorites(service.config, data);
  if (fav.driver?.driver) {
    lines.push(text.driver(fav.driver.driver.name, fav.driver.position, fav.driver.points));
  } else if (fav.driver?.unknown) {
    const list = knownDrivers(data).map(
      (driver) => `${driver.code || driver.number} ${driver.family}`,
    );
    lines.push(text.driverUnknown(fav.driver.unknown, list.join(', ')));
  }
  if (fav.team?.team) {
    lines.push(text.team(fav.team.team.name, fav.team.position, fav.team.points));
  } else if (fav.team?.unknown) {
    lines.push(
      text.teamUnknown(
        fav.team.unknown,
        knownTeams(data)
          .map((team) => team.name)
          .join(', '),
      ),
    );
  }
  lines.push('', service.apiError ? text.stale(service.apiError) : text.fresh);
  return lines.join('\n');
}
