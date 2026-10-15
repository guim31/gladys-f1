// -----------------------------------------------------------------------------
// The integration runs on its own clock (Gladys never polls the device), and
// its logs stay quiet: nothing at info on a normal day, race weekend
// included; a repeated failure logged once, its end logged once.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, fakeJolpica } from './helpers/world.js';

/** Captures the lines of the SDK logger (console.log / console.error). */
function captureLogs(t) {
  const previous = process.env.LOG_LEVEL;
  delete process.env.LOG_LEVEL; // the default level: info
  t.after(() => {
    if (previous !== undefined) {
      process.env.LOG_LEVEL = previous;
    }
  });
  const lines = [];
  const keep = (prefix, ...args) => lines.push([prefix, ...args].map(String).join(' '));
  t.mock.method(console, 'log', keep);
  t.mock.method(console, 'error', keep);
  return {
    lines,
    at: (level) => lines.filter((line) => line.includes(`[${level}]`)),
    clear: () => lines.splice(0),
  };
}

const flush = async () => {
  for (let i = 0; i < 20; i += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
};

test('the device is never polled: its own timer fires the triggers', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-10-25T19:57:10Z') });
  const world = await createWorld({ timers: true });
  t.after(() => world.app.stop());
  const [device] = world.gladys.fake.discoveredDevices;
  assert.equal(device.should_poll, false, 'Gladys 5.2.0 polls only should_poll devices');
  assert.equal(device.poll_frequency, undefined);
  for (let minute = 0; minute < 4; minute += 1) {
    t.mock.timers.tick(60_000);
    await flush();
  }
  // A fresh install catches nothing up (5 minutes before has passed); the
  // timer fires the start.
  assert.deepEqual(
    world.gladys.fake.sceneEvents.map((event) => event.data.minutes_before),
    [0],
  );
  assert.equal(world.state('next_session'), 'Course · en cours');
});

test('a race weekend writes nothing at info: ticks, readings, triggers', async (t) => {
  const logs = captureLogs(t);
  const api = fakeJolpica({ round: 16 });
  const world = await createWorld({ at: '2026-10-09T00:00:00Z', api });
  t.after(() => world.app.stop());
  logs.clear();
  await world.runUntil('2026-10-11T13:00:00Z');
  api.round = 17;
  await world.runUntil('2026-10-11T16:00:00Z');
  assert.ok(world.gladys.fake.sceneEvents.length > 10);
  assert.ok(world.gladys.fake.sceneEvents.some((event) => event.key === 'race_finished'));
  assert.deepEqual(logs.lines, []);
});

test('repeated failures are logged once, their end once', async (t) => {
  const logs = captureLogs(t);
  const api = fakeJolpica();
  const world = await createWorld({ api, at: '2026-10-25T13:30:00Z' });
  t.after(() => world.app.stop());
  // Jolpica-F1 rate-limits us, and Gladys refuses states, statuses and scene
  // events, for hours.
  api.status = 429;
  const down = async () => {
    throw new Error('Gladys is restarting');
  };
  const mocks = ['publishChangedStates', 'setConnectionStatus', 'publishSceneEvent'].map((name) =>
    t.mock.method(world.gladys, name, down),
  );
  await world.runUntil('2026-10-25T20:01:00Z');
  const warnings = logs.at('WARN');
  assert.equal(warnings.length, 4, warnings.join('\n'));
  for (const pattern of [
    /Could not read Jolpica-F1: Jolpica-F1 answered HTTP 429 \(rate limited\)/,
    /Could not report the status/,
    /Could not publish the states/,
    /Could not fire session_starting/,
  ]) {
    assert.equal(warnings.filter((line) => pattern.test(line)).length, 1, String(pattern));
  }
  assert.deepEqual(logs.at('INFO'), []);

  // Everything is back: one line per recovery, then silence.
  for (const mock of mocks) {
    mock.mock.restore();
  }
  api.status = 200;
  logs.clear();
  await world.runUntil('2026-10-25T20:15:00Z');
  const recoveries = logs.at('INFO');
  for (const pattern of [/Jolpica-F1 read again/, /States published again/]) {
    assert.equal(recoveries.filter((line) => pattern.test(line)).length, 1, String(pattern));
  }
  assert.equal(world.gladys.fake.connectionStatus.connected, true);
  logs.clear();
  await world.runUntil('2026-10-25T23:00:00Z');
  assert.deepEqual(logs.lines, []);
});
