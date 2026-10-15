// -----------------------------------------------------------------------------
// The "Formula 1" device: the next Grand Prix, the championship leaders, the
// last winner and, when chosen, the favorite driver and team. Read in the
// dashboard and in scene conditions ("only continue if there is a race
// today"). Every feature shares its type with another one: Gladys shows the
// generic label of the type instead of the feature name when a feature is
// alone of its type.
// -----------------------------------------------------------------------------

import { NAMES, SESSION_NAMES, STATE_TEXT } from './i18n.js';
import { countryName, favorites, nextRace, nextSession, raceRunning, sessionOf } from './season.js';
import { daysBetween, formatStart, localDate } from './time.js';

const TEXT = { category: 'text', type: 'text', min: 0, max: 0 };
const BINARY = { category: 'input', type: 'binary', min: 0, max: 1 };
const COUNT = (max) => ({ category: 'counter-sensor', type: 'integer', min: 0, max });

// Feature keys are forever (Gladys keys history and scenes on them).
export const FEATURES = [
  { key: 'next_grand_prix', ...TEXT },
  { key: 'next_circuit', ...TEXT },
  { key: 'next_country', ...TEXT },
  { key: 'next_race_start', ...TEXT },
  { key: 'next_qualifying_start', ...TEXT },
  { key: 'next_sprint_start', ...TEXT },
  { key: 'next_session', ...TEXT },
  {
    key: 'days_until_race',
    category: 'duration',
    type: 'integer',
    unit: 'days',
    min: 0,
    max: 366,
  },
  { key: 'next_round', ...COUNT(30) },
  { key: 'race_weekend', ...BINARY },
  { key: 'race_today', ...BINARY },
  { key: 'driver_leader', ...TEXT },
  { key: 'driver_leader_points', ...COUNT(2000) },
  { key: 'constructor_leader', ...TEXT },
  { key: 'constructor_leader_points', ...COUNT(2000) },
  { key: 'last_winner', ...TEXT },
  { key: 'last_podium', ...TEXT },
  { key: 'favorite_driver_position', ...COUNT(99), favorite: 'driver' },
  { key: 'favorite_driver_points', ...COUNT(2000), favorite: 'driver' },
  { key: 'favorite_driver_last_result', ...COUNT(99), favorite: 'driver' },
  { key: 'favorite_team_position', ...COUNT(99), favorite: 'team' },
  { key: 'favorite_team_points', ...COUNT(2000), favorite: 'team' },
  { key: 'favorite_team_last_result', ...COUNT(99), favorite: 'team' },
];

/** The ids of the device: one per Gladys, Formula 1 is the same for everyone. */
export function deviceIds(gladys) {
  return gladys.externalIds('formula1', 'f1');
}

function hasFavorite(config, kind) {
  return Boolean(kind === 'driver' ? config.favorite_driver : config.favorite_team);
}

export function buildDevice(gladys, config) {
  const ids = deviceIds(gladys);
  const names = NAMES[config.language];
  return {
    name: names.device,
    external_id: ids.device,
    should_poll: false,
    params: [{ name: 'source', value: 'Jolpica-F1' }],
    features: FEATURES.filter(
      (feature) => !feature.favorite || hasFavorite(config, feature.favorite),
    ).map(({ key, category, type, unit, min, max }) => ({
      name: names[key],
      external_id: ids.feature(key),
      category,
      type,
      ...(unit ? { unit } : {}),
      min,
      max,
      read_only: true,
      has_feedback: false,
    })),
  };
}

/** "Max Verstappen (Red Bull)" */
export function driverLabel(row) {
  return row.team?.name ? `${row.driver.name} (${row.team.name})` : row.driver.name;
}

/** "1. Max Verstappen · 2. Charles Leclerc · 3. George Russell" */
export function podiumText(results) {
  return results.results
    .slice(0, 3)
    .map((row) => `${row.position}. ${row.driver.name}`)
    .join(' · ');
}

/**
 * The states of the device at an instant. A value the integration does not
 * know (no results yet, favorite not found) is left out, never guessed.
 * @param {object} gladys the SDK client
 * @param {object} config a normalized configuration
 * @param {object} data { schedule, results, drivers, constructors } (parsed)
 * @param {{ now: number, timeZone: string }} at
 */
export function buildStates(gladys, config, data, { now, timeZone }) {
  const ids = deviceIds(gladys);
  const language = config.language;
  const text = STATE_TEXT[language];
  const sessionName = (key) => SESSION_NAMES[language][key];
  const states = [];
  const number = (key, value) => {
    if (Number.isFinite(value)) {
      states.push({ device_feature_external_id: ids.feature(key), state: value });
    }
  };
  const string = (key, value) => {
    if (value) {
      states.push({ device_feature_external_id: ids.feature(key), text: String(value) });
    }
  };
  const start = (session) => session && formatStart(session, language, timeZone);

  if (data.schedule) {
    const race = nextRace(data.schedule, now);
    if (race) {
      const today = localDate(now, timeZone);
      const first = race.sessions[0];
      string('next_grand_prix', race.name);
      string('next_circuit', [race.circuit.name, race.circuit.locality].filter(Boolean).join(', '));
      string('next_country', countryName(race.circuit.country, language));
      string('next_race_start', start(sessionOf(race, 'race')));
      string('next_qualifying_start', start(sessionOf(race, 'qualifying')));
      string('next_sprint_start', start(sessionOf(race, 'sprint')) || text.noSprint);
      const session = nextSession(race, now);
      string(
        'next_session',
        raceRunning(race, now)
          ? text.running(sessionName('race'))
          : session && `${sessionName(session.key)} · ${start(session)}`,
      );
      number('days_until_race', Math.max(0, daysBetween(today, localDate(race.start, timeZone))));
      number('next_round', race.round);
      number(
        'race_weekend',
        Number(
          today >= localDate(first.start, timeZone) && today <= localDate(race.start, timeZone),
        ),
      );
      number('race_today', Number(today === localDate(race.start, timeZone)));
    } else {
      const over = text.seasonOver(data.schedule.season);
      string('next_grand_prix', over);
      string('next_session', over);
      number('race_weekend', 0);
      number('race_today', 0);
    }
  }

  const leader = data.drivers?.rows[0];
  if (leader) {
    string('driver_leader', driverLabel(leader));
    number('driver_leader_points', leader.points);
  }
  const team = data.constructors?.rows[0];
  if (team) {
    string('constructor_leader', team.team.name);
    number('constructor_leader_points', team.points);
  }
  if (data.results) {
    string('last_winner', `${driverLabel(data.results.results[0])} · ${data.results.name}`);
    string('last_podium', podiumText(data.results));
  }

  const fav = favorites(config, data);
  if (fav.driver?.driver) {
    number('favorite_driver_position', fav.driver.position);
    number('favorite_driver_points', fav.driver.points);
    number('favorite_driver_last_result', fav.driver.lastResult);
  }
  if (fav.team?.team) {
    number('favorite_team_position', fav.team.position);
    number('favorite_team_points', fav.team.points);
    number('favorite_team_last_result', fav.team.lastResult);
  }
  return states;
}
