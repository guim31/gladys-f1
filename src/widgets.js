// -----------------------------------------------------------------------------
// Dashboard widget "Formula 1" (key "f1"): the next Grand Prix with its countdown and the
// sessions of the weekend in the time of Gladys, the favorites, the top 5 of
// a championship and the podium of the last race. Produced from the season,
// not from the device: it works before the device is added. Localized from
// the language of the person looking at it.
// -----------------------------------------------------------------------------

import { WIDGET_COLORS } from '@gladysassistant/integration-sdk';
import { LANGUAGES } from './config.js';
import { podiumText } from './device.js';
import { SESSION_NAMES, WIDGET_TEXT } from './i18n.js';
import { favorites, nextRace, nextSession, raceRunning } from './season.js';
import { WIDGET_KEY } from './service.js';
import { STANDINGS_KINDS } from './scenes.js';
import { formatStart } from './time.js';

export const TOP = 5;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function countdown(race, now, text) {
  if (raceRunning(race, now)) {
    return text.now;
  }
  const left = Math.max(0, race.start - now);
  if (left >= DAY) {
    return text.daysHours(Math.floor(left / DAY), Math.floor((left % DAY) / HOUR));
  }
  return text.hoursMinutes(Math.floor(left / HOUR), Math.floor((left % HOUR) / MINUTE));
}

function sessionColor(session, next, now) {
  if (session === next) {
    return WIDGET_COLORS.PRIMARY;
  }
  return session.start <= now ? WIDGET_COLORS.NEUTRAL : WIDGET_COLORS.INFO;
}

/**
 * The widget content.
 * @param {object} service the F1Service
 * @param {{ settings?: object, language?: string }} request
 */
export function buildContent(service, { settings = {}, language } = {}) {
  const lang = LANGUAGES.includes(language) ? language : service.config.language;
  const text = WIDGET_TEXT[lang];
  const now = service.now();
  const { data, timeZone } = service;
  const components = [];

  if (!data.schedule) {
    components.push({ type: 'text', variant: 'body', text: text.noData });
    return { ttl_seconds: 300, components };
  }

  const race = nextRace(data.schedule, now);
  if (race) {
    components.push({ type: 'text', variant: 'heading', text: race.name.slice(0, 40) });
    components.push({
      type: 'value',
      label: text.raceIn,
      value: countdown(race, now, text),
      icon: 'clock',
      color: raceRunning(race, now) ? WIDGET_COLORS.SUCCESS : WIDGET_COLORS.NEUTRAL,
    });
    components.push({
      type: 'value',
      label: text.round,
      value: `${race.round} / ${data.schedule.races.length}`,
      icon: 'flag',
    });
  } else {
    components.push({
      type: 'text',
      variant: 'heading',
      text: text.seasonOver(data.schedule.season),
    });
  }

  const fav = favorites(service.config, data);
  if (fav.driver?.driver && fav.driver.position) {
    components.push({
      type: 'value',
      label: fav.driver.driver.family.slice(0, 24),
      value: `P${fav.driver.position}`,
      icon: 'user',
      color: WIDGET_COLORS.PRIMARY,
    });
  }
  if (fav.team?.team && fav.team.position) {
    components.push({
      type: 'value',
      label: fav.team.team.name.slice(0, 24),
      value: `P${fav.team.position}`,
      icon: 'users',
      color: WIDGET_COLORS.PRIMARY,
    });
  }

  if (race) {
    const next = nextSession(race, now);
    components.push({
      type: 'status',
      items: race.sessions.map((session) => ({
        label: SESSION_NAMES[lang][session.key],
        value: formatStart(session, lang, timeZone),
        color: sessionColor(session, next, now),
      })),
    });
  }

  const kind = STANDINGS_KINDS.includes(settings.championship) ? settings.championship : 'drivers';
  const standings = kind === 'constructors' ? data.constructors : data.drivers;
  if (standings) {
    components.push({
      type: 'card-list',
      display: 'list',
      items: standings.rows.slice(0, TOP).map((row) => ({
        title: `${row.position}. ${kind === 'constructors' ? row.team.name : row.driver.name}`,
        ...(kind === 'drivers' && row.team.name ? { subtitle: row.team.name } : {}),
        badge: {
          text: text.points(row.points),
          color: row.position === 1 ? WIDGET_COLORS.SUCCESS : WIDGET_COLORS.NEUTRAL,
        },
      })),
    });
  }

  if (data.results) {
    components.push({
      type: 'text',
      variant: 'body',
      text: text.lastRace(data.results.name, podiumText(data.results)),
    });
  }
  // The clock asks for a refresh when the countdown or a session changes.
  return { ttl_seconds: 600, components };
}

export const WIDGETS = {
  [WIDGET_KEY]: {
    get: (service, request) => buildContent(service, request),
  },
};
