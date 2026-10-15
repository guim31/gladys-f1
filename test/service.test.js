// -----------------------------------------------------------------------------
// The service on the 2026 season as Jolpica-F1 served it: device states in the
// time of Gladys, the race weekend, the scene triggers (each once, restarts
// included), the reading cadence and the cache when the API is down.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStore, createWorld, fakeJolpica } from './helpers/world.js';

const startingEvents = (world) =>
  world.gladys.fake.sceneEvents.filter((event) => event.key === 'session_starting');

test('the device shows the next Grand Prix in the time of Gladys, and the championship', async (t) => {
  const world = await createWorld({
    config: { favorite_driver: 'Verstappen', favorite_team: 'red bull' },
  });
  t.after(() => world.app.stop());
  const expected = {
    next_grand_prix: 'United States Grand Prix',
    next_circuit: 'Circuit of the Americas, Austin',
    next_country: 'États-Unis',
    // 20:00 UTC on 25 October: 21:00 in Paris, after the end of summer time.
    next_race_start: 'dim. 25 oct. · 21:00',
    next_qualifying_start: 'sam. 24 oct. · 23:00',
    next_sprint_start: 'Pas de sprint',
    next_session: 'Essais libres 1 · ven. 23 oct. · 19:30',
    days_until_race: 10,
    next_round: 18,
    race_weekend: 0,
    race_today: 0,
    driver_leader: 'Andrea Kimi Antonelli (Mercedes)',
    driver_leader_points: 340,
    constructor_leader: 'Mercedes',
    constructor_leader_points: 578,
    last_winner: 'Max Verstappen (Red Bull) · Singapore Grand Prix',
    last_podium: '1. Max Verstappen · 2. Charles Leclerc · 3. Andrea Kimi Antonelli',
    favorite_driver_position: 4,
    favorite_driver_points: 221,
    favorite_driver_last_result: 1,
    favorite_team_position: 4,
    favorite_team_last_result: 1,
  };
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(world.state(key), value, key);
  }
  assert.equal(world.gladys.fake.connectionStatus.connected, true);
});

test('a sprint weekend, another time zone, and the race weekend flags', async (t) => {
  // Singapore, round 17: sprint weekend, seen from New York.
  const world = await createWorld({
    config: { language: 'en' },
    at: '2026-10-10T02:00:00Z',
    api: fakeJolpica({ round: 16 }),
    timeZone: 'America/New_York',
  });
  t.after(() => world.app.stop());
  assert.equal(world.state('next_grand_prix'), 'Singapore Grand Prix');
  assert.equal(world.state('next_sprint_start'), 'Sat, Oct 10 · 05:00');
  assert.equal(world.state('race_weekend'), 1);
  assert.equal(world.state('race_today'), 0);
  assert.equal(world.state('next_session'), 'Sprint · Sat, Oct 10 · 05:00');

  // The race (12:00 UTC on 11 October) is running: 08:00 in New York.
  world.clock.set('2026-10-11T12:30:00Z');
  await world.service.tick();
  assert.equal(world.state('race_today'), 1);
  assert.equal(world.state('days_until_race'), 0);
  assert.equal(world.state('next_session'), 'Race · now');
  assert.equal(world.state('next_grand_prix'), 'Singapore Grand Prix');
  // Three hours after the start, the next Grand Prix is Austin.
  world.clock.set('2026-10-11T15:01:00Z');
  await world.service.tick();
  assert.equal(world.state('next_grand_prix'), 'United States Grand Prix');
  assert.equal(world.state('race_weekend'), 0);
});

test('"session starting" fires once per session and lead time', async (t) => {
  const store = createMemoryStore();
  const world = await createWorld({ at: '2026-10-25T17:50:00Z', store });
  t.after(() => world.app.stop());
  await world.runUntil('2026-10-25T20:01:00Z');
  const events = startingEvents(world);
  assert.deepEqual(
    events.map((event) => [event.data.session, event.data.minutes_before]),
    [
      ['race', 120],
      ['race', 60],
      ['race', 30],
      ['race', 15],
      ['race', 5],
      ['race', 0],
    ],
  );
  assert.deepEqual(events[3].data, {
    session: 'race',
    minutes_before: 15,
    session_name: 'Course',
    grand_prix: 'United States Grand Prix',
    circuit: 'Circuit of the Americas',
    round: 18,
    start_time: '21:00',
  });
  await world.app.stop();

  // A restart a few minutes later fires nothing again.
  const again = await createWorld({ at: '2026-10-25T20:05:00Z', store });
  t.after(() => again.app.stop());
  await again.runUntil('2026-10-25T20:10:00Z');
  assert.deepEqual(startingEvents(again), []);
});

test('after a short outage, the triggers of the last 10 minutes are fired late', async (t) => {
  const store = createMemoryStore({
    'triggers.json': { lastCheck: Date.parse('2026-10-25T19:52:00Z') },
  });
  const world = await createWorld({ at: '2026-10-25T20:04:00Z', store });
  t.after(() => world.app.stop());
  assert.deepEqual(
    startingEvents(world).map((event) => event.data.minutes_before),
    [5, 0],
  );
  // A longer outage: only the last 10 minutes are caught up.
  const late = await createWorld({
    at: '2026-10-25T20:09:00Z',
    store: createMemoryStore({ 'triggers.json': { lastCheck: 0 } }),
  });
  t.after(() => late.app.stop());
  assert.deepEqual(
    startingEvents(late).map((event) => event.data.minutes_before),
    [0],
  );
});

test('"race finished" fires when the results of a new race appear', async (t) => {
  const api = fakeJolpica({ round: 16 });
  const world = await createWorld({
    config: { favorite_driver: 'LEC', favorite_team: 'McLaren' },
    at: '2026-10-11T10:00:00Z',
    api,
  });
  t.after(() => world.app.stop());
  const finishedEvents = () =>
    world.gladys.fake.sceneEvents.filter((event) => event.key === 'race_finished');
  // The results of the Malaysian race were there at install: no event.
  assert.deepEqual(finishedEvents(), []);

  // Singapore starts at 12:00 UTC; Jolpica-F1 publishes it at 14:00.
  await world.runUntil('2026-10-11T14:00:00Z');
  assert.deepEqual(finishedEvents(), []);
  api.round = 17;
  const before = api.calls.length;
  await world.runUntil('2026-10-11T16:00:00Z');
  const finished = finishedEvents();
  assert.equal(finished.length, 1);
  assert.deepEqual(finished[0].data, {
    grand_prix: 'Singapore Grand Prix',
    round: 17,
    winner: 'Max Verstappen',
    winner_team: 'Red Bull',
    podium: '1. Max Verstappen · 2. Charles Leclerc · 3. Andrea Kimi Antonelli',
    favorite_driver_position: 2,
    favorite_team_position: 4,
    summary:
      'Max Verstappen (Red Bull) remporte le Singapore Grand Prix, devant Charles Leclerc et Andrea Kimi Antonelli. Charles Leclerc termine 2e.',
  });
  // Results and standings of round 17 read: back to the quiet cadence.
  assert.ok(api.calls.length - before <= 3, api.calls.slice(before).join(', '));
  assert.equal(world.state('last_winner'), 'Max Verstappen (Red Bull) · Singapore Grand Prix');
  assert.equal(world.state('favorite_driver_last_result'), 2);
});

test('the API is read a few times a day, and every 10 minutes after a race only', async (t) => {
  const api = fakeJolpica();
  const world = await createWorld({ at: '2026-10-15T00:00:00Z', api });
  t.after(() => world.app.stop());
  await world.runUntil('2026-10-16T00:00:00Z');
  // 4 documents at start, the calendar once more, results and standings
  // every 6 hours: far from the 500 requests per hour allowed.
  assert.equal(api.calls.length, 4 + 1 + 3 * 4);

  // After a race whose results never come, the watch stops after 48 hours.
  const late = fakeJolpica({ round: 16 });
  const watch = await createWorld({ at: '2026-10-11T10:00:00Z', api: late });
  t.after(() => watch.app.stop());
  await watch.runUntil('2026-10-14T10:00:00Z');
  const results = late.calls.filter((path) => path === '/current/last/results.json').length;
  // 13:30 → 12:00 two days later, every 10 minutes, plus the 6-hour reads.
  assert.ok(results > 200 && results < 300, `${results} reads of the results`);
});

test('every state is published again twice a day, unchanged ones included', async (t) => {
  const world = await createWorld({ at: '2026-10-15T08:00:00Z' });
  t.after(() => world.app.stop());
  const leaderCount = () =>
    world.gladys.fake.states.filter((state) =>
      state.device_feature_external_id.endsWith(':driver_leader'),
    ).length;
  assert.equal(leaderCount(), 1);
  await world.runUntil('2026-10-15T19:00:00Z');
  assert.equal(leaderCount(), 1);
  await world.runUntil('2026-10-15T20:01:00Z');
  assert.equal(leaderCount(), 2);
});

test('without Jolpica-F1, the cache keeps the device going and the status says why', async (t) => {
  const store = createMemoryStore();
  const first = await createWorld({ store });
  await first.app.stop();

  const api = fakeJolpica({ fail: true });
  const world = await createWorld({ store, api, at: '2026-10-16T10:00:00Z' });
  t.after(() => world.app.stop());
  assert.equal(world.state('next_grand_prix'), 'United States Grand Prix');
  assert.equal(world.state('days_until_race'), 9);
  const status = world.gladys.fake.connectionStatus;
  assert.equal(status.connected, false);
  assert.match(status.message.fr, /Jolpica-F1 est injoignable/);

  // No new attempt before 10 minutes, then the service recovers.
  const calls = api.calls.length;
  await world.runUntil('2026-10-16T10:09:00Z');
  assert.equal(api.calls.length, calls);
  api.fail = false;
  await world.runUntil('2026-10-16T10:11:00Z');
  assert.equal(world.gladys.fake.connectionStatus.connected, true);
});

test('an unknown favorite is reported, and its features stay empty', async (t) => {
  const world = await createWorld({ config: { favorite_driver: 'Senna', language: 'en' } });
  t.after(() => world.app.stop());
  const status = world.gladys.fake.connectionStatus;
  assert.equal(status.connected, false);
  assert.equal(status.message.en, 'Favorite driver "Senna" not found in the current season.');
  assert.equal(world.state('favorite_driver_position'), undefined);

  await world.gladys.fake.configUpdated({ favorite_driver: 'Leclerc', language: 'en' });
  assert.equal(world.gladys.fake.connectionStatus.connected, true);
  assert.equal(world.state('favorite_driver_position'), 5);
});

test('adding the device publishes every state again, and refreshes the widget', async (t) => {
  const world = await createWorld();
  t.after(() => world.app.stop());
  const before = world.gladys.fake.states.length;
  const refreshes = world.gladys.fake.widgetRefreshes.length;
  await world.gladys.fake.deviceCreated(world.gladys.fake.discoveredDevices[0]);
  assert.equal(world.gladys.fake.states.length - before, 17);
  assert.equal(world.gladys.fake.widgetRefreshes.length, refreshes + 1);
});
