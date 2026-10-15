// -----------------------------------------------------------------------------
// Jolpica-F1 (https://api.jolpi.ca), the open successor of the Ergast API: no
// account, no key. Its published limits for anonymous use are 4 requests per
// second and 500 per hour: the client spaces its requests, and the service
// (src/service.js) reads four documents a few times a day, from a cache in
// /data.
//
// The parsers turn the Ergast-shaped answers into small plain objects: the
// rest of the integration never reads `MRData`.
// -----------------------------------------------------------------------------

export const API_BASE = 'https://api.jolpi.ca/ergast/f1';

// The four documents the integration reads, all for the current season.
export const PATHS = {
  schedule: '/current.json',
  results: '/current/last/results.json',
  drivers: '/current/driverstandings.json',
  constructors: '/current/constructorstandings.json',
};

const REQUEST_TIMEOUT_MS = 20_000;
const MIN_SPACING_MS = 400; // 4 requests per second at most, with margin
const USER_AGENT = 'gladys-f1 (+https://github.com/guim31/gladys-f1)';

export class JolpicaError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'JolpicaError';
    this.status = status;
  }
}

/**
 * @param {object} [options]
 * @param {Function} [options.fetch] the global fetch by default (tests inject one)
 * @param {Function} [options.sleep] waits between requests (tests skip it)
 */
export function createJolpica({ fetch = globalThis.fetch, sleep = defaultSleep } = {}) {
  let last = 0;
  return {
    /** GET a path of the API (one of PATHS), the parsed JSON. */
    async get(path) {
      const wait = last + MIN_SPACING_MS - Date.now();
      if (wait > 0) {
        await sleep(wait);
      }
      last = Date.now();
      let response;
      try {
        response = await fetch(`${API_BASE}${path}`, {
          headers: { accept: 'application/json', 'user-agent': USER_AGENT },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (err) {
        throw new JolpicaError(`Jolpica-F1 unreachable: ${err.message}`);
      }
      if (!response.ok) {
        const reason = response.status === 429 ? ' (rate limited)' : '';
        throw new JolpicaError(
          `Jolpica-F1 answered HTTP ${response.status}${reason}`,
          response.status,
        );
      }
      try {
        return await response.json();
      } catch {
        throw new JolpicaError('Jolpica-F1 sent something that is not JSON');
      }
    },
  };
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------------------------------------------------------------------------
// Parsers
// -----------------------------------------------------------------------------

// Ergast key → session key of the integration (frozen: scene filters store it).
const SESSION_KEYS = [
  ['FirstPractice', 'practice_1'],
  ['SecondPractice', 'practice_2'],
  ['ThirdPractice', 'practice_3'],
  ['SprintQualifying', 'sprint_qualifying'],
  ['SprintShootout', 'sprint_qualifying'], // its 2023 name
  ['Sprint', 'sprint'],
  ['Qualifying', 'qualifying'],
];

export const SESSIONS = [
  'practice_1',
  'practice_2',
  'practice_3',
  'sprint_qualifying',
  'sprint',
  'qualifying',
  'race',
];

function table(json, name) {
  const data = json?.MRData?.[name];
  if (!data || typeof data !== 'object') {
    throw new JolpicaError(`Unexpected Jolpica-F1 answer: no ${name}`);
  }
  return data;
}

/**
 * The start of a session. A session whose time is not known yet has only a
 * date: it starts at noon UTC "for sorting", flagged `timed: false`, and no
 * scene trigger is fired for it.
 */
function instant(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
    return null;
  }
  if (/^\d{2}:\d{2}(:\d{2})?Z$/.test(time ?? '')) {
    const ms = Date.parse(`${date}T${time}`);
    return Number.isFinite(ms) ? { start: ms, timed: true } : null;
  }
  return { start: Date.parse(`${date}T12:00:00Z`), timed: false };
}

function circuitOf(race) {
  const location = race.Circuit?.Location ?? {};
  return {
    id: race.Circuit?.circuitId ?? '',
    name: race.Circuit?.circuitName ?? '',
    locality: location.locality ?? '',
    country: location.country ?? '',
  };
}

/** The season calendar: races sorted by round, each with its sessions sorted by start. */
export function parseSchedule(json) {
  const data = table(json, 'RaceTable');
  const races = (data.Races ?? [])
    .map((race) => {
      const sessions = [];
      for (const [ergastKey, key] of SESSION_KEYS) {
        const at = race[ergastKey] && instant(race[ergastKey].date, race[ergastKey].time);
        if (at && !sessions.some((session) => session.key === key)) {
          sessions.push({ key, ...at });
        }
      }
      const raceAt = instant(race.date, race.time);
      if (!raceAt) {
        return null;
      }
      sessions.push({ key: 'race', ...raceAt });
      sessions.sort((a, b) => a.start - b.start);
      return {
        season: Number(race.season),
        round: Number(race.round),
        name: race.raceName ?? '',
        circuit: circuitOf(race),
        date: race.date,
        start: raceAt.start,
        sessions,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.round - b.round);
  return { season: Number(data.season) || races[0]?.season || null, races };
}

function driverOf(driver = {}) {
  const given = driver.givenName ?? '';
  const family = driver.familyName ?? '';
  return {
    id: driver.driverId ?? '',
    code: driver.code ?? '',
    number: driver.permanentNumber ?? '',
    given,
    family,
    name: `${given} ${family}`.trim(),
  };
}

function teamOf(constructor = {}) {
  return { id: constructor.constructorId ?? '', name: constructor.name ?? '' };
}

/** The last race result, null when the season has none yet. */
export function parseResults(json) {
  const [race] = table(json, 'RaceTable').Races ?? [];
  if (!race || !Array.isArray(race.Results) || race.Results.length === 0) {
    return null;
  }
  return {
    season: Number(race.season),
    round: Number(race.round),
    name: race.raceName ?? '',
    circuit: circuitOf(race),
    date: race.date,
    results: race.Results.map((row) => ({
      // A car not classified has a position (its order) but a letter as
      // positionText: R(etired), D(isqualified), W(ithdrawn), N(ot classified).
      position: Number(row.position),
      classified: /^\d+$/.test(row.positionText ?? ''),
      points: Number(row.points) || 0,
      driver: driverOf(row.Driver),
      team: teamOf(row.Constructor),
      status: row.status ?? '',
    })).sort((a, b) => a.position - b.position),
  };
}

function standingsList(json) {
  const [list] = table(json, 'StandingsTable').StandingsLists ?? [];
  return list ?? null;
}

/** The drivers' championship, null before the first race. */
export function parseDriverStandings(json) {
  const list = standingsList(json);
  if (!list || !Array.isArray(list.DriverStandings) || list.DriverStandings.length === 0) {
    return null;
  }
  return {
    season: Number(list.season),
    round: Number(list.round),
    rows: list.DriverStandings.map((row, index) => ({
      // positionText "-" for a driver without classification: keep the order.
      position: Number(row.position) || index + 1,
      points: Number(row.points) || 0,
      wins: Number(row.wins) || 0,
      driver: driverOf(row.Driver),
      team: teamOf(row.Constructors?.at(-1)),
    })),
  };
}

/** The constructors' championship, null before the first race. */
export function parseConstructorStandings(json) {
  const list = standingsList(json);
  if (
    !list ||
    !Array.isArray(list.ConstructorStandings) ||
    list.ConstructorStandings.length === 0
  ) {
    return null;
  }
  return {
    season: Number(list.season),
    round: Number(list.round),
    rows: list.ConstructorStandings.map((row, index) => ({
      position: Number(row.position) || index + 1,
      points: Number(row.points) || 0,
      wins: Number(row.wins) || 0,
      team: teamOf(row.Constructor),
    })),
  };
}

export const PARSERS = {
  schedule: parseSchedule,
  results: parseResults,
  drivers: parseDriverStandings,
  constructors: parseConstructorStandings,
};
