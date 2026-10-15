// -----------------------------------------------------------------------------
// Instants shown in the time zone of Gladys (TZ, injected by the supervisor).
// The API gives every session in UTC; the device, the widget and the scene
// texts show them as the user lives them: "Sun 25 Oct · 22:00".
// -----------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The time zone of Gladys: TZ, set by the supervisor. Checked here rather
 * than trusted to the system (the Alpine image has no tzdata; Node's ICU
 * carries its own zones): an unusable value falls back to the process one.
 */
export function processTimeZone(env = process.env.TZ) {
  if (env) {
    try {
      return new Intl.DateTimeFormat('en', { timeZone: env }).resolvedOptions().timeZone;
    } catch {
      // Not an IANA name (':/etc/localtime'…): fall through.
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

const cache = new Map();

function formatter(key, make) {
  let value = cache.get(key);
  if (!value) {
    value = make();
    cache.set(key, value);
  }
  return value;
}

/** The calendar date ('YYYY-MM-DD') of an instant in a time zone. */
export function localDate(ms, timeZone) {
  return formatter(
    `date:${timeZone}`,
    () =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
  ).format(new Date(ms));
}

/** Whole calendar days from one date to another ('YYYY-MM-DD'). */
export function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** "22:00" */
export function formatTime(ms, language, timeZone) {
  return formatter(
    `time:${language}:${timeZone}`,
    () =>
      new Intl.DateTimeFormat(language, {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }),
  ).format(new Date(ms));
}

/** "dim. 25 oct." ('short') or "dimanche 25 octobre" ('long'). */
export function formatDay(ms, language, timeZone, style = 'short') {
  return formatter(
    `day:${style}:${language}:${timeZone}`,
    () =>
      new Intl.DateTimeFormat(language, {
        timeZone,
        weekday: style,
        day: 'numeric',
        month: style,
      }),
  ).format(new Date(ms));
}

/**
 * A session start for a feature or a widget row: "dim. 25 oct. · 22:00", or
 * the day alone when the time is not known yet.
 */
export function formatStart({ start, timed }, language, timeZone) {
  const day = formatDay(start, language, timeZone, 'short');
  return timed ? `${day} · ${formatTime(start, language, timeZone)}` : day;
}
