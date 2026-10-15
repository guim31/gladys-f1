// -----------------------------------------------------------------------------
// The Jolpica-F1 client and parsers, on answers recorded during the 2026
// season (test/fixtures/jolpica, see its README).
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  JolpicaError,
  PATHS,
  createJolpica,
  parseConstructorStandings,
  parseDriverStandings,
  parseResults,
  parseSchedule,
} from '../src/jolpica.js';
import { findDriver, findTeam, knownDrivers, knownTeams } from '../src/season.js';
import { fixture } from './helpers/world.js';

test('the calendar: 23 races, sessions sorted, sprint weekends recognized', () => {
  const schedule = parseSchedule(fixture('schedule-2026'));
  assert.equal(schedule.season, 2026);
  assert.equal(schedule.races.length, 23);
  const singapore = schedule.races[16];
  assert.equal(singapore.name, 'Singapore Grand Prix');
  assert.deepEqual(
    singapore.sessions.map((session) => session.key),
    ['practice_1', 'sprint_qualifying', 'sprint', 'qualifying', 'race'],
  );
  assert.equal(singapore.start, Date.parse('2026-10-11T12:00:00Z'));
  assert.ok(singapore.sessions.every((session) => session.timed));
  assert.deepEqual(
    schedule.races[17].sessions.map((session) => session.key),
    ['practice_1', 'practice_2', 'practice_3', 'qualifying', 'race'],
  );
  assert.deepEqual(singapore.circuit, {
    id: 'marina_bay',
    name: 'Marina Bay Street Circuit',
    locality: 'Marina Bay',
    country: 'Singapore',
  });
});

test('a session without a time yet is kept by its day, flagged untimed', () => {
  const json = fixture('schedule-2026');
  const race = json.MRData.RaceTable.Races[22];
  delete race.time;
  delete race.Qualifying.time;
  const abuDhabi = parseSchedule(json).races[22];
  const untimed = abuDhabi.sessions.filter((session) => !session.timed).map((s) => s.key);
  assert.deepEqual(untimed.sort(), ['qualifying', 'race']);
});

test('results and standings', () => {
  const results = parseResults(fixture('results-2026-17'));
  assert.equal(results.round, 17);
  assert.equal(results.results.length, 22);
  assert.deepEqual(
    results.results.slice(0, 3).map((row) => [row.position, row.driver.code, row.team.name]),
    [
      [1, 'VER', 'Red Bull'],
      [2, 'LEC', 'Ferrari'],
      [3, 'ANT', 'Mercedes'],
    ],
  );
  assert.ok(
    results.results.some((row) => !row.classified),
    'a retirement in Singapore',
  );
  const drivers = parseDriverStandings(fixture('driverstandings-2026-17'));
  assert.deepEqual(
    [drivers.round, drivers.rows[0].driver.name, drivers.rows[0].points],
    [17, 'Andrea Kimi Antonelli', 340],
  );
  const teams = parseConstructorStandings(fixture('constructorstandings-2026-17'));
  assert.deepEqual([teams.rows[0].team.name, teams.rows[0].points], ['Mercedes', 578]);
});

test('before the first race, results and standings are null', () => {
  const empty = {
    MRData: { RaceTable: { season: '2027', Races: [] }, StandingsTable: { StandingsLists: [] } },
  };
  assert.equal(parseResults(empty), null);
  assert.equal(parseDriverStandings(empty), null);
  assert.equal(parseConstructorStandings(empty), null);
  assert.throws(() => parseSchedule({}), JolpicaError);
});

test('favorites are found by code, number, name or id, accents and case ignored', () => {
  const data = {
    drivers: parseDriverStandings(fixture('driverstandings-2026-17')),
    constructors: parseConstructorStandings(fixture('constructorstandings-2026-17')),
    results: parseResults(fixture('results-2026-17')),
  };
  const drivers = knownDrivers(data);
  for (const query of ['VER', 'ver', '3', 'Verstappen', 'max verstappen', 'max_verstappen']) {
    assert.equal(findDriver(query, drivers)?.id, 'max_verstappen', query);
  }
  assert.equal(findDriver('Senna', drivers), null);
  const teams = knownTeams(data);
  for (const query of ['Red Bull', 'red_bull', 'REDBULL']) {
    assert.equal(findTeam(query, teams)?.id, 'red_bull', query);
  }
  assert.equal(findTeam('Brabham', teams), null);
});

test('the client reads the four documents, and turns failures into clear errors', async () => {
  const urls = [];
  const ok = createJolpica({
    fetch: async (url, options) => {
      urls.push([url, options.headers['user-agent']]);
      return { ok: true, status: 200, json: async () => ({ MRData: {} }) };
    },
    sleep: async () => {},
  });
  for (const path of Object.values(PATHS)) {
    await ok.get(path);
  }
  assert.deepEqual(
    urls.map(([url]) => url),
    [
      'https://api.jolpi.ca/ergast/f1/current.json',
      'https://api.jolpi.ca/ergast/f1/current/last/results.json',
      'https://api.jolpi.ca/ergast/f1/current/driverstandings.json',
      'https://api.jolpi.ca/ergast/f1/current/constructorstandings.json',
    ],
  );
  assert.match(urls[0][1], /^gladys-f1/);

  const limited = createJolpica({
    fetch: async () => ({ ok: false, status: 429 }),
    sleep: async () => {},
  });
  await assert.rejects(limited.get(PATHS.schedule), /HTTP 429 \(rate limited\)/);
  const down = createJolpica({
    fetch: async () => {
      throw new Error('fetch failed');
    },
    sleep: async () => {},
  });
  await assert.rejects(down.get(PATHS.schedule), /Jolpica-F1 unreachable: fetch failed/);
  const html = createJolpica({
    fetch: async () => ({ ok: true, status: 200, json: async () => JSON.parse('<html>') }),
    sleep: async () => {},
  });
  await assert.rejects(html.get(PATHS.schedule), /not JSON/);
});

test('requests are spaced: 4 per second at most', async () => {
  const waits = [];
  const client = createJolpica({
    fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
    sleep: async (ms) => waits.push(ms),
  });
  await client.get(PATHS.schedule);
  await client.get(PATHS.results);
  assert.equal(waits.length, 1);
  assert.ok(waits[0] > 250 && waits[0] <= 400, String(waits[0]));
});
