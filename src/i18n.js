// -----------------------------------------------------------------------------
// Every text the code produces, in the four languages of the Gladys interface.
// German says "du", Spanish "usted". The device has no user language: its
// names, its texts and the scene texts follow the `language` setting; the
// widget gets the language of the person looking at it. Grand Prix, circuit,
// driver and team names come from Jolpica-F1, in English: they are names.
// -----------------------------------------------------------------------------

/** Feature names, frozen by Gladys when the device is created. */
export const NAMES = {
  en: {
    device: 'Formula 1',
    next_grand_prix: 'Next Grand Prix',
    next_circuit: 'Circuit',
    next_country: 'Country',
    next_race_start: 'Race start',
    next_qualifying_start: 'Qualifying start',
    next_sprint_start: 'Sprint start',
    next_session: 'Next session',
    days_until_race: 'Days until the race',
    next_round: 'Round',
    race_weekend: 'Race weekend',
    race_today: 'Race today',
    driver_leader: "Drivers' leader",
    driver_leader_points: "Drivers' leader points",
    constructor_leader: "Constructors' leader",
    constructor_leader_points: "Constructors' leader points",
    last_winner: 'Last winner',
    last_podium: 'Last podium',
    favorite_driver_position: 'Favorite driver: position',
    favorite_driver_points: 'Favorite driver: points',
    favorite_driver_last_result: 'Favorite driver: last GP',
    favorite_team_position: 'Favorite team: position',
    favorite_team_points: 'Favorite team: points',
    favorite_team_last_result: 'Favorite team: last GP',
  },
  fr: {
    device: 'Formule 1',
    next_grand_prix: 'Prochain Grand Prix',
    next_circuit: 'Circuit',
    next_country: 'Pays',
    next_race_start: 'Départ de la course',
    next_qualifying_start: 'Début des qualifications',
    next_sprint_start: 'Départ du sprint',
    next_session: 'Prochaine séance',
    days_until_race: 'Jours avant la course',
    next_round: 'Manche',
    race_weekend: 'Week-end de course',
    race_today: "Course aujourd'hui",
    driver_leader: 'Leader pilotes',
    driver_leader_points: 'Points du leader pilotes',
    constructor_leader: 'Leader constructeurs',
    constructor_leader_points: 'Points du leader constructeurs',
    last_winner: 'Dernier vainqueur',
    last_podium: 'Dernier podium',
    favorite_driver_position: 'Pilote favori : position',
    favorite_driver_points: 'Pilote favori : points',
    favorite_driver_last_result: 'Pilote favori : dernier GP',
    favorite_team_position: 'Écurie favorite : position',
    favorite_team_points: 'Écurie favorite : points',
    favorite_team_last_result: 'Écurie favorite : dernier GP',
  },
  de: {
    device: 'Formel 1',
    next_grand_prix: 'Nächster Grand Prix',
    next_circuit: 'Strecke',
    next_country: 'Land',
    next_race_start: 'Rennstart',
    next_qualifying_start: 'Start des Qualifyings',
    next_sprint_start: 'Start des Sprints',
    next_session: 'Nächste Session',
    days_until_race: 'Tage bis zum Rennen',
    next_round: 'Lauf',
    race_weekend: 'Rennwochenende',
    race_today: 'Rennen heute',
    driver_leader: 'Fahrer-Spitzenreiter',
    driver_leader_points: 'Punkte Fahrer-Spitzenreiter',
    constructor_leader: 'Konstrukteurs-Spitzenreiter',
    constructor_leader_points: 'Punkte Konstrukteurs-Spitze',
    last_winner: 'Letzter Sieger',
    last_podium: 'Letztes Podium',
    favorite_driver_position: 'Lieblingsfahrer: Position',
    favorite_driver_points: 'Lieblingsfahrer: Punkte',
    favorite_driver_last_result: 'Lieblingsfahrer: letzter GP',
    favorite_team_position: 'Lieblingsteam: Position',
    favorite_team_points: 'Lieblingsteam: Punkte',
    favorite_team_last_result: 'Lieblingsteam: letzter GP',
  },
  es: {
    device: 'Fórmula 1',
    next_grand_prix: 'Próximo Gran Premio',
    next_circuit: 'Circuito',
    next_country: 'País',
    next_race_start: 'Salida de la carrera',
    next_qualifying_start: 'Inicio de la clasificación',
    next_sprint_start: 'Salida del sprint',
    next_session: 'Próxima sesión',
    days_until_race: 'Días hasta la carrera',
    next_round: 'Ronda',
    race_weekend: 'Fin de semana de carrera',
    race_today: 'Carrera hoy',
    driver_leader: 'Líder de pilotos',
    driver_leader_points: 'Puntos del líder de pilotos',
    constructor_leader: 'Líder de constructores',
    constructor_leader_points: 'Puntos del líder de constructores',
    last_winner: 'Último ganador',
    last_podium: 'Último podio',
    favorite_driver_position: 'Piloto favorito: posición',
    favorite_driver_points: 'Piloto favorito: puntos',
    favorite_driver_last_result: 'Piloto favorito: último GP',
    favorite_team_position: 'Equipo favorito: posición',
    favorite_team_points: 'Equipo favorito: puntos',
    favorite_team_last_result: 'Equipo favorito: último GP',
  },
};

/** The sessions of a race weekend (keys frozen: scene filters store them). */
export const SESSION_NAMES = {
  en: {
    practice_1: 'Practice 1',
    practice_2: 'Practice 2',
    practice_3: 'Practice 3',
    sprint_qualifying: 'Sprint Qualifying',
    sprint: 'Sprint',
    qualifying: 'Qualifying',
    race: 'Race',
  },
  fr: {
    practice_1: 'Essais libres 1',
    practice_2: 'Essais libres 2',
    practice_3: 'Essais libres 3',
    sprint_qualifying: 'Qualifications sprint',
    sprint: 'Sprint',
    qualifying: 'Qualifications',
    race: 'Course',
  },
  de: {
    practice_1: '1. Freies Training',
    practice_2: '2. Freies Training',
    practice_3: '3. Freies Training',
    sprint_qualifying: 'Sprint-Qualifying',
    sprint: 'Sprint',
    qualifying: 'Qualifying',
    race: 'Rennen',
  },
  es: {
    practice_1: 'Libres 1',
    practice_2: 'Libres 2',
    practice_3: 'Libres 3',
    sprint_qualifying: 'Clasificación sprint',
    sprint: 'Sprint',
    qualifying: 'Clasificación',
    race: 'Carrera',
  },
};

/** Texts of the device states. */
export const STATE_TEXT = {
  en: {
    noSprint: 'No sprint',
    seasonOver: (season) => `Season ${season} over`,
    running: (session) => `${session} · now`,
  },
  fr: {
    noSprint: 'Pas de sprint',
    seasonOver: (season) => `Saison ${season} terminée`,
    running: (session) => `${session} · en cours`,
  },
  de: {
    noSprint: 'Kein Sprint',
    seasonOver: (season) => `Saison ${season} beendet`,
    running: (session) => `${session} · läuft`,
  },
  es: {
    noSprint: 'Sin sprint',
    seasonOver: (season) => `Temporada ${season} terminada`,
    running: (session) => `${session} · en curso`,
  },
};

const numberFormats = new Map();

function number(language, n) {
  let format = numberFormats.get(language);
  if (!format) {
    format = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
    numberFormats.set(language, format);
  }
  return format.format(n);
}

/** "221 points", "1 point", "0,5 point" ("Punkten" after "mit" in German). */
export function points(language, n, { dative = false } = {}) {
  const one = language === 'fr' ? Math.abs(n) < 2 : n === 1;
  const words = {
    en: ['point', 'points'],
    fr: ['point', 'points'],
    de: ['Punkt', dative ? 'Punkten' : 'Punkte'],
    es: ['punto', 'puntos'],
  }[language];
  return `${number(language, n)} ${one ? words[0] : words[1]}`;
}

/** "1st", "1er", "1.", "1.º": a finishing position in a sentence. */
export const ORDINAL = {
  en: (n) => {
    const tens = n % 100;
    const suffix =
      tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
    return `${n}${suffix}`;
  },
  fr: (n) => (n === 1 ? '1er' : `${n}e`),
  de: (n) => `${n}.`,
  es: (n) => `${n}.º`,
};

/** The dashboard widget. Tile values hold 12 characters at most. */
export const WIDGET_TEXT = {
  en: {
    raceIn: 'Race in',
    round: 'Round',
    daysHours: (d, h) => `${d} d ${h} h`,
    hoursMinutes: (h, m) => `${h} h ${m} min`,
    now: 'Now',
    points: (n) => `${number('en', n)} pts`,
    lastRace: (name, podium) => `Last race, ${name}: ${podium}`,
    seasonOver: (season) => `Season ${season} over`,
    noData: 'The Formula 1 data is not available yet: try again in a few minutes.',
  },
  fr: {
    raceIn: 'Course dans',
    round: 'Manche',
    daysHours: (d, h) => `${d} j ${h} h`,
    hoursMinutes: (h, m) => `${h} h ${m} min`,
    now: 'En cours',
    points: (n) => `${number('fr', n)} pts`,
    lastRace: (name, podium) => `Dernier GP, ${name} : ${podium}`,
    seasonOver: (season) => `Saison ${season} terminée`,
    noData:
      'Les données de Formule 1 ne sont pas encore disponibles : réessayez dans quelques minutes.',
  },
  de: {
    raceIn: 'Rennen in',
    round: 'Lauf',
    daysHours: (d, h) => `${d} T ${h} h`,
    hoursMinutes: (h, m) => `${h} h ${m} min`,
    now: 'Läuft',
    points: (n) => `${number('de', n)} Pkt.`,
    lastRace: (name, podium) => `Letztes Rennen, ${name}: ${podium}`,
    seasonOver: (season) => `Saison ${season} beendet`,
    noData:
      'Die Formel-1-Daten sind noch nicht verfügbar: versuch es in ein paar Minuten noch einmal.',
  },
  es: {
    raceIn: 'Carrera en',
    round: 'Ronda',
    daysHours: (d, h) => `${d} d ${h} h`,
    hoursMinutes: (h, m) => `${h} h ${m} min`,
    now: 'En curso',
    points: (n) => `${number('es', n)} pts`,
    lastRace: (name, podium) => `Última carrera, ${name}: ${podium}`,
    seasonOver: (season) => `Temporada ${season} terminada`,
    noData: 'Los datos de Fórmula 1 aún no están disponibles: inténtelo de nuevo en unos minutos.',
  },
};

/**
 * Sentences ready to send (scene actions and the "race finished" trigger).
 * `race` = { name, round, circuit, locality, country, day, time, days }.
 */
export const SENTENCES = {
  en: {
    nextRace: (r) =>
      `Next Grand Prix: ${r.name}, round ${r.round}, ${r.circuit}, ${r.locality} (${r.country}). ` +
      `Race ${when(r, { today: 'today', tomorrow: 'tomorrow', on: 'on', at: 'at' })}` +
      `${r.days > 1 ? `, in ${r.days} days` : ''}.`,
    running: (name) => `The ${name} is under way.`,
    seasonOver: (season) => `The ${season} season is over.`,
    noData: 'The Formula 1 data is not available yet.',
    standings: (kind, round, rows) =>
      `${kind === 'drivers' ? "Drivers'" : "Constructors'"} championship after round ${round}: ` +
      `${rows.map((row) => `${row.position}. ${row.name}, ${points('en', row.points)}`).join('; ')}.`,
    noStandings: 'The championship has not started yet.',
    raceFinished: (name, podium) =>
      `${podium[0].name} (${podium[0].team}) wins the ${name}` +
      `${podium.length >= 3 ? `, ahead of ${podium[1].name} and ${podium[2].name}` : ''}.`,
    favoriteFinished: (name, position) =>
      position > 0 ? ` ${name} finishes ${ORDINAL.en(position)}.` : ` ${name} is not classified.`,
  },
  fr: {
    nextRace: (r) =>
      `Prochain Grand Prix : ${r.name}, manche ${r.round}, ${r.circuit}, ${r.locality} (${r.country}). ` +
      `Course ${when(r, { today: "aujourd'hui", tomorrow: 'demain', on: '', at: 'à' })}` +
      `${r.days > 1 ? `, dans ${r.days} jours` : ''}.`,
    running: (name) => `Le ${name} est en cours.`,
    seasonOver: (season) => `La saison ${season} est terminée.`,
    noData: 'Les données de Formule 1 ne sont pas encore disponibles.',
    standings: (kind, round, rows) =>
      `Championnat ${kind === 'drivers' ? 'pilotes' : 'constructeurs'} après la manche ${round} : ` +
      `${rows.map((row) => `${row.position}. ${row.name}, ${points('fr', row.points)}`).join(' ; ')}.`,
    noStandings: "Le championnat n'a pas encore commencé.",
    raceFinished: (name, podium) =>
      `${podium[0].name} (${podium[0].team}) remporte le ${name}` +
      `${podium.length >= 3 ? `, devant ${podium[1].name} et ${podium[2].name}` : ''}.`,
    favoriteFinished: (name, position) =>
      position > 0 ? ` ${name} termine ${ORDINAL.fr(position)}.` : ` ${name} n'est pas classé.`,
  },
  de: {
    nextRace: (r) =>
      `Nächster Grand Prix: ${r.name}, Lauf ${r.round}, ${r.circuit}, ${r.locality} (${r.country}). ` +
      `Rennen ${when(r, { today: 'heute', tomorrow: 'morgen', on: 'am', at: 'um' })}` +
      `${r.days > 1 ? `, in ${r.days} Tagen` : ''}.`,
    running: (name) => `Der ${name} läuft gerade.`,
    seasonOver: (season) => `Die Saison ${season} ist beendet.`,
    noData: 'Die Formel-1-Daten sind noch nicht verfügbar.',
    standings: (kind, round, rows) =>
      `${kind === 'drivers' ? 'Fahrerwertung' : 'Konstrukteurswertung'} nach Lauf ${round}: ` +
      `${rows.map((row) => `${row.position}. ${row.name}, ${points('de', row.points)}`).join('; ')}.`,
    noStandings: 'Die Meisterschaft hat noch nicht begonnen.',
    raceFinished: (name, podium) =>
      `${podium[0].name} (${podium[0].team}) gewinnt den ${name}` +
      `${podium.length >= 3 ? ` vor ${podium[1].name} und ${podium[2].name}` : ''}.`,
    favoriteFinished: (name, position) =>
      position > 0 ? ` ${name} wird ${ORDINAL.de(position)}` : ` ${name} wird nicht gewertet.`,
  },
  es: {
    nextRace: (r) =>
      `Próximo Gran Premio: ${r.name}, ronda ${r.round}, ${r.circuit}, ${r.locality} (${r.country}). ` +
      `Carrera ${when(r, { today: 'hoy', tomorrow: 'mañana', on: 'el', at: 'a las' })}` +
      `${r.days > 1 ? `, dentro de ${r.days} días` : ''}.`,
    running: (name) => `El ${name} está en curso.`,
    seasonOver: (season) => `La temporada ${season} ha terminado.`,
    noData: 'Los datos de Fórmula 1 aún no están disponibles.',
    standings: (kind, round, rows) =>
      `Campeonato de ${kind === 'drivers' ? 'pilotos' : 'constructores'} tras la ronda ${round}: ` +
      `${rows.map((row) => `${row.position}. ${row.name}, ${points('es', row.points)}`).join('; ')}.`,
    noStandings: 'El campeonato aún no ha empezado.',
    raceFinished: (name, podium) =>
      `${podium[0].name} (${podium[0].team}) gana el ${name}` +
      `${podium.length >= 3 ? `, por delante de ${podium[1].name} y ${podium[2].name}` : ''}.`,
    favoriteFinished: (name, position) =>
      position > 0 ? ` ${name} termina ${ORDINAL.es(position)}.` : ` ${name} no se clasifica.`,
  },
};

// "today at 22:00", "on Sunday 25 October at 22:00", the day alone when the
// time is not known yet.
function when(r, words) {
  const day =
    r.days === 0 ? words.today : r.days === 1 ? words.tomorrow : `${words.on} ${r.day}`.trim();
  return r.time ? `${day} ${words.at} ${r.time}` : day;
}

/** Report of the "Check" action of the Configuration screen. */
export const CHECK_TEXT = {
  en: {
    season: (season, rounds) => `Season ${season}: ${rounds} Grands Prix.`,
    next: (sentence) => sentence,
    last: (name, winner) => `Last race: ${name}, won by ${winner}.`,
    driver: (name, position, total) =>
      `Favorite driver: ${name}${position ? `, ${ORDINAL.en(position)} with ${points('en', total)}` : ''}.`,
    team: (name, position, total) =>
      `Favorite team: ${name}${position ? `, ${ORDINAL.en(position)} with ${points('en', total)}` : ''}.`,
    driverUnknown: (query, list) =>
      `Favorite driver "${query}" not found. Drivers of the season: ${list}.`,
    teamUnknown: (query, list) =>
      `Favorite team "${query}" not found. Teams of the season: ${list}.`,
    fresh: 'Data read from Jolpica-F1 just now.',
    stale: (reason) =>
      `Jolpica-F1 could not be read (${reason}): the figures above come from the cache.`,
  },
  fr: {
    season: (season, rounds) => `Saison ${season} : ${rounds} Grands Prix.`,
    next: (sentence) => sentence,
    last: (name, winner) => `Dernière course : ${name}, gagnée par ${winner}.`,
    driver: (name, position, total) =>
      `Pilote favori : ${name}${position ? `, ${ORDINAL.fr(position)} avec ${points('fr', total)}` : ''}.`,
    team: (name, position, total) =>
      `Écurie favorite : ${name}${position ? `, ${ORDINAL.fr(position)} avec ${points('fr', total)}` : ''}.`,
    driverUnknown: (query, list) =>
      `Pilote favori « ${query} » introuvable. Pilotes de la saison : ${list}.`,
    teamUnknown: (query, list) =>
      `Écurie favorite « ${query} » introuvable. Écuries de la saison : ${list}.`,
    fresh: "Données lues à l'instant sur Jolpica-F1.",
    stale: (reason) =>
      `Jolpica-F1 n'a pas pu être lu (${reason}) : les chiffres ci-dessus viennent du cache.`,
  },
  de: {
    season: (season, rounds) => `Saison ${season}: ${rounds} Grands Prix.`,
    next: (sentence) => sentence,
    last: (name, winner) => `Letztes Rennen: ${name}, gewonnen von ${winner}.`,
    driver: (name, position, total) =>
      `Lieblingsfahrer: ${name}${position ? `, ${ORDINAL.de(position)} mit ${points('de', total, { dative: true })}` : ''}.`,
    team: (name, position, total) =>
      `Lieblingsteam: ${name}${position ? `, ${ORDINAL.de(position)} mit ${points('de', total, { dative: true })}` : ''}.`,
    driverUnknown: (query, list) =>
      `Lieblingsfahrer „${query}“ nicht gefunden. Fahrer der Saison: ${list}.`,
    teamUnknown: (query, list) =>
      `Lieblingsteam „${query}“ nicht gefunden. Teams der Saison: ${list}.`,
    fresh: 'Daten gerade eben von Jolpica-F1 gelesen.',
    stale: (reason) =>
      `Jolpica-F1 konnte nicht gelesen werden (${reason}): Die Zahlen oben stammen aus dem Cache.`,
  },
  es: {
    season: (season, rounds) => `Temporada ${season}: ${rounds} Grandes Premios.`,
    next: (sentence) => sentence,
    last: (name, winner) => `Última carrera: ${name}, ganada por ${winner}.`,
    driver: (name, position, total) =>
      `Piloto favorito: ${name}${position ? `, ${ORDINAL.es(position)} con ${points('es', total)}` : ''}.`,
    team: (name, position, total) =>
      `Equipo favorito: ${name}${position ? `, ${ORDINAL.es(position)} con ${points('es', total)}` : ''}.`,
    driverUnknown: (query, list) =>
      `Piloto favorito «${query}» no encontrado. Pilotos de la temporada: ${list}.`,
    teamUnknown: (query, list) =>
      `Equipo favorito «${query}» no encontrado. Equipos de la temporada: ${list}.`,
    fresh: 'Datos leídos ahora mismo en Jolpica-F1.',
    stale: (reason) =>
      `No se pudo leer Jolpica-F1 (${reason}): las cifras anteriores proceden de la caché.`,
  },
};

/** Problems shown in the connection status of the Configuration screen. */
export const PROBLEM_TEXT = {
  en: {
    unreachable: () => 'Jolpica-F1 cannot be reached: new attempt in 10 minutes.',
    driverUnknown: (query) => `Favorite driver "${query}" not found in the current season.`,
    teamUnknown: (query) => `Favorite team "${query}" not found in the current season.`,
  },
  fr: {
    unreachable: () => 'Jolpica-F1 est injoignable : nouvel essai dans 10 minutes.',
    driverUnknown: (query) => `Pilote favori « ${query} » introuvable dans la saison en cours.`,
    teamUnknown: (query) => `Écurie favorite « ${query} » introuvable dans la saison en cours.`,
  },
  de: {
    unreachable: () => 'Jolpica-F1 ist nicht erreichbar: neuer Versuch in 10 Minuten.',
    driverUnknown: (query) => `Lieblingsfahrer „${query}“ in der laufenden Saison nicht gefunden.`,
    teamUnknown: (query) => `Lieblingsteam „${query}“ in der laufenden Saison nicht gefunden.`,
  },
  es: {
    unreachable: () => 'No se puede acceder a Jolpica-F1: nuevo intento en 10 minutos.',
    driverUnknown: (query) => `Piloto favorito «${query}» no encontrado en la temporada actual.`,
    teamUnknown: (query) => `Equipo favorito «${query}» no encontrado en la temporada actual.`,
  },
};

export const INIT_FAILED = {
  en: 'Initialization failed, check the integration logs.',
  fr: "L'initialisation a échoué, consultez les journaux de l'intégration.",
  de: 'Die Initialisierung ist fehlgeschlagen, sieh dir die Protokolle der Integration an.',
  es: 'La inicialización ha fallado, consulte los registros de la integración.',
};

/** A multi-language object built from a table: { en: pick(table.en), … }. */
export function inEveryLanguage(table, pick) {
  return Object.fromEntries(
    Object.entries(table).map(([language, text]) => [language, pick(text)]),
  );
}
