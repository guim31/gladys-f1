// -----------------------------------------------------------------------------
// What the cached documents mean at a given instant: the next Grand Prix and
// its next session, the race weekend, the favorites of the user. Pure
// functions of (data, now): the service, the widget and the scene actions all
// read the season through them.
// -----------------------------------------------------------------------------

import { foldName } from './config.js';

// A race stays "the next one" until this long after its start: a Grand Prix
// lasts about two hours, red flags included most of the time.
export const RACE_DURATION_MS = 3 * 60 * 60 * 1000;

/** The season has a calendar (a new season may be published empty first). */
export function hasCalendar(schedule) {
  return Boolean(schedule?.races.length);
}

/** The next race (or the one running now), null when the season is over. */
export function nextRace(schedule, now) {
  return schedule?.races.find((race) => race.start + RACE_DURATION_MS > now) ?? null;
}

/** The last race started, whose results may not be published yet. */
export function lastStartedRace(schedule, now) {
  return schedule?.races.findLast((race) => race.start <= now) ?? null;
}

/** The next session of a race weekend not started yet, null when all have. */
export function nextSession(race, now) {
  return race?.sessions.find((session) => session.start > now) ?? null;
}

export function sessionOf(race, key) {
  return race?.sessions.find((session) => session.key === key) ?? null;
}

/** True when the race has started and is likely still running. */
export function raceRunning(race, now) {
  return Boolean(race) && race.start <= now && now < race.start + RACE_DURATION_MS;
}

/**
 * A driver of the season matching what the user typed: the three-letter code
 * ("VER"), the car number ("1"), the family name ("Verstappen"), the full name
 * or the Jolpica id ("max_verstappen"); case, accents and spaces ignored.
 * @param {string} query
 * @param {object[]} drivers driver objects of the standings and the results
 */
export function findDriver(query, drivers) {
  const wanted = foldName(query);
  if (!wanted) {
    return null;
  }
  const keys = (driver) => [driver.code, driver.number, driver.family, driver.name, driver.id];
  return (
    drivers.find((driver) => keys(driver).some((key) => key && foldName(key) === wanted)) ?? null
  );
}

/** A team matching what the user typed: "Ferrari", "red bull", "red_bull"… */
export function findTeam(query, teams) {
  const wanted = foldName(query);
  if (!wanted) {
    return null;
  }
  return (
    teams.find((team) => foldName(team.name) === wanted || foldName(team.id) === wanted) ?? null
  );
}

/** Every driver the season knows, standings first. */
export function knownDrivers(data) {
  const all = [
    ...(data.drivers?.rows ?? []).map((row) => row.driver),
    ...(data.results?.results ?? []).map((row) => row.driver),
  ];
  return unique(all, (driver) => driver.id);
}

export function knownTeams(data) {
  const all = [
    ...(data.constructors?.rows ?? []).map((row) => row.team),
    ...(data.results?.results ?? []).map((row) => row.team),
  ];
  return unique(all, (team) => team.id);
}

function unique(list, key) {
  const seen = new Set();
  return list.filter((item) => {
    const id = key(item);
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}

/**
 * The favorites of the user, resolved against the season.
 * @returns {{ driver: object|null, team: object|null }} each with its
 *   championship row, its last race result (a position, 0 when not classified
 *   or absent) and the query when it matched nothing (`unknown`)
 */
export function favorites(config, data) {
  const out = { driver: null, team: null };
  if (config.favorite_driver) {
    const driver = findDriver(config.favorite_driver, knownDrivers(data));
    if (!driver) {
      out.driver = { unknown: config.favorite_driver };
    } else {
      const standing = data.drivers?.rows.find((row) => row.driver.id === driver.id) ?? null;
      const result = data.results?.results.find((row) => row.driver.id === driver.id) ?? null;
      out.driver = {
        driver,
        position: standing?.position ?? null,
        points: standing?.points ?? null,
        lastResult: data.results ? (result?.classified ? result.position : 0) : null,
      };
    }
  }
  if (config.favorite_team) {
    const team = findTeam(config.favorite_team, knownTeams(data));
    if (!team) {
      out.team = { unknown: config.favorite_team };
    } else {
      const standing = data.constructors?.rows.find((row) => row.team.id === team.id) ?? null;
      // The best classified car of the team.
      const result = data.results?.results.find((row) => row.team.id === team.id && row.classified);
      out.team = {
        team,
        position: standing?.position ?? null,
        points: standing?.points ?? null,
        lastResult: data.results ? (result?.position ?? 0) : null,
      };
    }
  }
  return out;
}

// Country names of the API → ISO 3166 codes, for names in the user's language.
const COUNTRY_CODES = {
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Bahrain: 'BH',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  China: 'CN',
  France: 'FR',
  Germany: 'DE',
  Hungary: 'HU',
  India: 'IN',
  Italy: 'IT',
  Japan: 'JP',
  Korea: 'KR',
  Malaysia: 'MY',
  Mexico: 'MX',
  Monaco: 'MC',
  Morocco: 'MA',
  Netherlands: 'NL',
  Portugal: 'PT',
  Qatar: 'QA',
  Russia: 'RU',
  'Saudi Arabia': 'SA',
  Singapore: 'SG',
  'South Africa': 'ZA',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Thailand: 'TH',
  Turkey: 'TR',
  UAE: 'AE',
  UK: 'GB',
  USA: 'US',
  'United States': 'US',
  Vietnam: 'VN',
};

const regionNames = new Map();

/** "USA" → "États-Unis"; an unknown name is kept as the API wrote it. */
export function countryName(country, language) {
  const code = COUNTRY_CODES[country];
  if (!code) {
    return country;
  }
  let names = regionNames.get(language);
  if (!names) {
    names = new Intl.DisplayNames([language], { type: 'region' });
    regionNames.set(language, names);
  }
  return names.of(code) ?? country;
}
