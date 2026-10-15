// -----------------------------------------------------------------------------
// A running integration against the SDK's fake Gladys, with a clock the test
// moves, Jolpica-F1 served from answers recorded during the 2026 season
// (test/fixtures/jolpica) and /data kept in memory. No network.
// -----------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { createFakeGladys } from '@gladysassistant/integration-sdk/testing';
import { registerHandlers } from '../../src/app.js';
import { createJolpica } from '../../src/jolpica.js';

/** A recorded answer of Jolpica-F1 (recorded on 2026-10-15). */
export function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/jolpica/${name}.json`, import.meta.url), 'utf8'),
  );
}

/**
 * A fetch serving the recorded answers "after round N" of 2026 (16 or 17),
 * counting the calls. `fail` makes every request fail like a network error,
 * `status` answers that HTTP status instead.
 */
export function fakeJolpica({ round = 17, fail = false, status = 200 } = {}) {
  const api = {
    calls: [],
    round,
    fail,
    status,
    fetch: async (url) => {
      const path = new URL(url).pathname.replace(/^\/ergast\/f1/, '');
      api.calls.push(path);
      if (api.fail) {
        throw new Error('getaddrinfo ENOTFOUND api.jolpi.ca');
      }
      const files = {
        '/current.json': 'schedule-2026',
        '/current/last/results.json': `results-2026-${api.round}`,
        '/current/driverstandings.json': `driverstandings-2026-${api.round}`,
        '/current/constructorstandings.json': `constructorstandings-2026-${api.round}`,
      };
      if (!files[path]) {
        return { ok: false, status: 404, json: async () => ({}) };
      }
      return {
        ok: api.status === 200,
        status: api.status,
        json: async () => fixture(files[path]),
      };
    },
  };
  return api;
}

export function createMemoryStore(files = {}) {
  const content = new Map(Object.entries(files));
  return {
    files: content,
    load: (name) => (content.has(name) ? structuredClone(content.get(name)) : null),
    save: (name, value) => content.set(name, structuredClone(value)),
  };
}

/** A clock the test sets and moves. */
export function createClock(iso) {
  const clock = {
    ms: Date.parse(iso),
    now: () => clock.ms,
    set: (value) => {
      clock.ms = Date.parse(value);
    },
    advance: (ms) => {
      clock.ms += ms;
    },
  };
  return clock;
}

/**
 * @param {object} [options]
 * @param {object} [options.config] the configuration saved in Gladys
 * @param {string} [options.at] the instant of the start (ISO)
 * @param {string} [options.timeZone] Gladys' time zone
 * @param {object} [options.api] fakeJolpica()
 * @param {object} [options.store] createMemoryStore()
 * @param {boolean} [options.connect] false: handlers registered, not started
 * @param {boolean} [options.timers] true: the real clock of the service runs,
 *   on Date.now and setTimeout (to mock with t.mock.timers)
 */
export async function createWorld({
  config = {},
  at = '2026-10-15T10:00:00Z',
  timeZone = 'Europe/Paris',
  api = fakeJolpica(),
  store = createMemoryStore(),
  devices = [],
  connect = true,
  timers = false,
} = {}) {
  const clock = createClock(at);
  const gladys = createFakeGladys({ config, devices });
  const app = registerHandlers(gladys, {
    store,
    api: createJolpica({ fetch: api.fetch, sleep: async () => {} }),
    now: timers ? () => Date.now() : clock.now,
    timeZone,
    timers,
  });
  if (connect) {
    await gladys.connect();
  }
  const { service } = app;
  return {
    gladys,
    app,
    service,
    clock,
    api,
    store,
    /** The last value Gladys received for a feature key of the device. */
    state(key) {
      const device = gladys.fake.discoveredDevices.at(-1);
      return gladys.fake.lastState(`${device.external_id}:${key}`);
    },
    /** Moves the clock minute by minute up to an instant, ticking each minute. */
    async runUntil(iso) {
      const target = Date.parse(iso);
      while (clock.ms < target) {
        clock.advance(Math.min(60_000, target - clock.ms));
        await service.tick();
      }
    },
  };
}
