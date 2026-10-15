// -----------------------------------------------------------------------------
// Scene actions (manifest `scene_actions`): sentences ready to send in a
// message or to say aloud ({{<column>.<row>.sentence}}), in the language of
// the configuration (a scene action does not get the user's language), and a
// few values for conditions.
// -----------------------------------------------------------------------------

import { SENTENCES } from './i18n.js';
import { countryName, nextRace, raceRunning, sessionOf } from './season.js';
import { daysBetween, formatDay, formatTime, localDate } from './time.js';

export const STANDINGS_KINDS = ['drivers', 'constructors'];
export const DEFAULT_COUNT = 3;
export const MAX_COUNT = 10;

/** The next Grand Prix as words, and its main values. */
export function nextRaceSummary(service, language = service.config.language) {
  const now = service.now();
  const { timeZone } = service;
  const sentences = SENTENCES[language];
  const schedule = service.data.schedule;
  if (!schedule) {
    return { sentence: sentences.noData, race: null, days: -1, start: '' };
  }
  const race = nextRace(schedule, now);
  if (!race) {
    return { sentence: sentences.seasonOver(schedule.season), race: null, days: -1, start: '' };
  }
  const session = sessionOf(race, 'race');
  const days = Math.max(0, daysBetween(localDate(now, timeZone), localDate(race.start, timeZone)));
  const day = formatDay(race.start, language, timeZone, 'long');
  const time = session.timed ? formatTime(race.start, language, timeZone) : '';
  const sentence = raceRunning(race, now)
    ? sentences.running(race.name)
    : sentences.nextRace({
        name: race.name,
        round: race.round,
        circuit: race.circuit.name,
        locality: race.circuit.locality,
        country: countryName(race.circuit.country, language),
        day,
        time,
        days,
      });
  return { sentence, race, days, start: time ? `${day} ${time}` : day };
}

/** The top of a championship as words, and its leader. */
export function standingsSummary(service, kind, count, language = service.config.language) {
  const sentences = SENTENCES[language];
  const standings = kind === 'constructors' ? service.data.constructors : service.data.drivers;
  if (!standings) {
    return { sentence: sentences.noStandings, leader: '', points: 0 };
  }
  const rows = standings.rows.slice(0, count).map((row) => ({
    position: row.position,
    name: kind === 'constructors' ? row.team.name : row.driver.name,
    points: row.points,
  }));
  return {
    sentence: sentences.standings(kind, standings.round, rows),
    leader: rows[0].name,
    points: rows[0].points,
  };
}

function clampCount(value) {
  const count = Math.trunc(Number(value ?? DEFAULT_COUNT));
  return Number.isFinite(count) && count > 0 ? Math.min(count, MAX_COUNT) : DEFAULT_COUNT;
}

export const SCENE_ACTIONS = {
  read_next_grand_prix: async (service) => {
    const summary = nextRaceSummary(service);
    return {
      sentence: summary.sentence,
      grand_prix: summary.race?.name ?? '',
      race_start: summary.start,
      days_until_race: summary.days,
    };
  },
  read_standings: async (service, { fields = {} }) => {
    const kind = STANDINGS_KINDS.includes(fields.championship) ? fields.championship : 'drivers';
    const summary = standingsSummary(service, kind, clampCount(fields.count));
    return { sentence: summary.sentence, leader: summary.leader, leader_points: summary.points };
  },
};
