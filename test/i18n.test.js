// -----------------------------------------------------------------------------
// Every text Gladys shows exists in the four languages of its interface
// (English, French, German, Spanish): the manifest, the message tables of the
// code and the four documentation files. German says "du", never the polite
// "Sie"; Spanish says "usted".
// -----------------------------------------------------------------------------

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LANGUAGES } from '../src/config.js';
import {
  CHECK_TEXT,
  INIT_FAILED,
  NAMES,
  ORDINAL,
  PROBLEM_TEXT,
  SENTENCES,
  SESSION_NAMES,
  STATE_TEXT,
  WIDGET_TEXT,
} from '../src/i18n.js';

const manifest = JSON.parse(
  await readFile(new URL('../gladys-assistant-integration.json', import.meta.url), 'utf8'),
);

const LANGS = ['en', 'fr', 'de', 'es'];
const POLITE_GERMAN = /(?<!\p{L})(Sie|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres)(?!\p{L})/u;

// Upper bounds, in characters: what the Gladys interface shows without cutting.
const MAX = {
  catalog: 100,
  widgetLabel: 30,
  label: 60,
  placeholder: 60,
  description: 300,
  message: 200,
  featureName: 40,
  tileValue: 12,
  tileLabel: 24,
  badge: 16,
  caption: 80,
  body: 300,
  detail: 2000,
};

const sorted = (keys) => [...keys].sort();

/** Checks one multi-language object; returns its problems. */
function problems(value, path, max) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [`${path} must be a multi-language object`];
  }
  const found = [];
  if (JSON.stringify(sorted(Object.keys(value))) !== JSON.stringify(sorted(LANGS))) {
    found.push(`${path} has [${Object.keys(value)}], expected exactly [${LANGS}]`);
  }
  for (const [lang, text] of Object.entries(value)) {
    found.push(...textProblems(text, `${path}.${lang}`, lang, max));
  }
  return found;
}

function textProblems(text, path, lang, max) {
  if (typeof text !== 'string' || text.trim() === '') {
    return [`${path} is empty`];
  }
  const found = [];
  if (text.length > max) {
    found.push(`${path} has ${text.length} characters (${max} at most)`);
  }
  if (lang === 'de' && POLITE_GERMAN.test(text)) {
    found.push(`${path} uses the polite form: "${text}"`);
  }
  return found;
}

/** Every multi-language object of the manifest, with its length limit. */
function manifestTexts(root) {
  const texts = [];
  const walk = (value, path, key) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`, key));
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const isText =
      ['label', 'description', 'placeholder'].includes(key) ||
      Object.keys(value).some((child) => LANGS.includes(child));
    if (isText) {
      const max =
        path === 'manifest.description' || /^manifest\.widgets\[\d+\]\.description$/.test(path)
          ? MAX.catalog
          : /^manifest\.widgets\[\d+\]\.label$/.test(path)
            ? MAX.widgetLabel
            : (MAX[key] ?? MAX.label);
      texts.push({ path, value, max });
      return;
    }
    for (const [child, item] of Object.entries(value)) {
      walk(item, `${path}.${child}`, child);
    }
  };
  walk(root, 'manifest', null);
  return texts;
}

// Tables written one language at a time: same keys everywhere, no empty text.
function tableProblems(table, name, maxOf, render = (value) => value) {
  const found = [];
  if (JSON.stringify(sorted(Object.keys(table))) !== JSON.stringify(sorted(LANGS))) {
    found.push(`${name} has [${Object.keys(table)}], expected exactly [${LANGS}]`);
  }
  for (const lang of LANGS) {
    const entries = table[lang] ?? {};
    if (
      JSON.stringify(sorted(Object.keys(entries))) !== JSON.stringify(sorted(Object.keys(table.en)))
    ) {
      found.push(`${name}.${lang} does not have the keys of ${name}.en`);
    }
    for (const [key, value] of Object.entries(entries)) {
      found.push(...textProblems(render(value, key), `${name}.${lang}.${key}`, lang, maxOf(key)));
    }
  }
  return found;
}

test('the configuration offers the four languages', () => {
  assert.deepEqual(LANGUAGES, LANGS);
});

test('every text of the manifest is in English, French, German and Spanish', () => {
  const texts = manifestTexts(manifest);
  assert.ok(texts.length >= 60, `only ${texts.length} texts found in the manifest`);
  const found = texts.flatMap(({ path, value, max }) => problems(value, path, max));
  assert.deepEqual(found, []);
});

test('the catalog description holds 10 characters at least in every language', () => {
  for (const lang of LANGS) {
    assert.ok(manifest.description[lang].length >= 10, `description.${lang} is too short`);
  }
});

test('the feature and session names exist in every language', () => {
  assert.deepEqual(
    tableProblems(NAMES, 'NAMES', () => MAX.featureName),
    [],
  );
  assert.deepEqual(
    tableProblems(SESSION_NAMES, 'SESSION_NAMES', () => MAX.tileLabel),
    [],
  );
  const render = (value) => (typeof value === 'function' ? value('Sprint Qualifying') : value);
  assert.deepEqual(
    tableProblems(STATE_TEXT, 'STATE_TEXT', () => MAX.featureName, render),
    [],
  );
});

test('the widget texts exist in every language, tile values within 12 characters', () => {
  const widgetMax = (key) =>
    ({
      raceIn: MAX.tileLabel,
      round: MAX.tileLabel,
      daysHours: MAX.tileValue,
      hoursMinutes: MAX.tileValue,
      now: MAX.tileValue,
      points: MAX.badge,
      lastRace: MAX.body,
      seasonOver: 40,
      noData: MAX.body,
    })[key];
  const render = (value, key) => {
    if (typeof value !== 'function') {
      return value;
    }
    if (key === 'daysHours') {
      return value(366, 23);
    }
    if (key === 'hoursMinutes') {
      return value(23, 59);
    }
    if (key === 'points') {
      return value(1999);
    }
    if (key === 'seasonOver') {
      return value(2026);
    }
    return value(
      'Bahrain Grand Prix in Malaysia',
      '1. Andrea Kimi Antonelli · 2. Max Verstappen · 3. Charles Leclerc',
    );
  };
  assert.deepEqual(tableProblems(WIDGET_TEXT, 'WIDGET_TEXT', widgetMax, render), []);
});

test('the sentences, the check report and the problems exist in every language', () => {
  const race = {
    name: 'United States Grand Prix',
    round: 18,
    circuit: 'Circuit of the Americas',
    locality: 'Austin',
    country: 'USA',
    day: 'Sunday 25 October',
    time: '21:00',
    days: 10,
  };
  const podium = [
    { name: 'A', team: 'X' },
    { name: 'B', team: 'Y' },
    { name: 'C', team: 'Z' },
  ];
  const render = (value, key) => {
    if (typeof value !== 'function') {
      return value;
    }
    return (
      {
        nextRace: () => value(race),
        standings: () => value('drivers', 17, [{ position: 1, name: 'A', points: 10 }]),
        raceFinished: () => value('Singapore Grand Prix', podium),
        favoriteFinished: () => value('Charles Leclerc', 2),
        seasonOver: () => value(2026),
      }[key]?.() ?? value('Singapore Grand Prix')
    );
  };
  assert.deepEqual(
    tableProblems(SENTENCES, 'SENTENCES', () => MAX.body, render),
    [],
  );
  const renderCheck = (value) =>
    typeof value === 'function' ? value('Max Verstappen', 4, 221) : value;
  assert.deepEqual(
    tableProblems(CHECK_TEXT, 'CHECK_TEXT', () => 2000, renderCheck),
    [],
  );
  const renderProblem = (value) => value('Senna');
  assert.deepEqual(
    tableProblems(PROBLEM_TEXT, 'PROBLEM_TEXT', () => MAX.message, renderProblem),
    [],
  );
  assert.deepEqual(problems(INIT_FAILED, 'INIT_FAILED', MAX.message), []);
  assert.deepEqual(
    LANGS.map((lang) => [1, 2, 3, 4, 11, 22].map(ORDINAL[lang]).join(' ')),
    [
      '1st 2nd 3rd 4th 11th 22nd',
      '1er 2e 3e 4e 11e 22e',
      '1. 2. 3. 4. 11. 22.',
      '1.º 2.º 3.º 4.º 11.º 22.º',
    ],
  );
});

test('the four documentation files exist, with the same sections', async () => {
  const docs = {};
  for (const lang of LANGS) {
    docs[lang] = await readFile(new URL(`../docs/${lang}.md`, import.meta.url), 'utf8');
    assert.ok(docs[lang].length >= 300, `docs/${lang}.md is too short`);
  }
  const outline = (text) =>
    text
      .split('\n')
      .filter((line) => /^#{1,4} /.test(line))
      .map((line) => line.match(/^#+/)[0]);
  for (const lang of LANGS) {
    assert.deepEqual(outline(docs[lang]), outline(docs.en), `docs/${lang}.md sections`);
  }
  assert.ok(outline(docs.en).length >= 8);
  assert.doesNotMatch(docs.de, POLITE_GERMAN, 'docs/de.md uses the polite form');
  for (const lang of LANGS) {
    assert.match(
      docs[lang],
      /feedback|retours|Rückmeldungen|comentarios/i,
      `${lang}: hardware note`,
    );
  }
});

test('the guard catches a missing language, an empty text and the polite German form', () => {
  assert.equal(problems({ en: 'Light', fr: 'Éclairage', de: 'Licht' }, 'x', 60).length, 1);
  assert.equal(problems({ en: 'Light', fr: 'Éclairage', de: '', es: 'Luz' }, 'x', 60).length, 1);
  assert.equal(problems({ en: 'a', fr: 'a', de: 'a', es: 'a', it: 'a' }, 'x', 60).length, 1);
  assert.equal(problems({ en: 'a', fr: 'a', de: 'a'.repeat(61), es: 'a' }, 'x', 60).length, 1);
  for (const polite of [
    'Wählen Sie',
    'Ihr Gerät',
    'Ihre Zone',
    'mit Ihrem',
    'Ihren',
    'Ihrer',
    'Ihres',
  ]) {
    assert.equal(problems({ en: 'a', fr: 'a', de: polite, es: 'a' }, 'x', 60).length, 1, polite);
  }
  assert.deepEqual(
    problems({ en: 'a', fr: 'a', de: 'Siebenschläfer, ihre', es: 'a' }, 'x', 60),
    [],
  );
  const forgotten = structuredClone(manifest);
  delete forgotten.scene_actions[1].fields[0].label.de;
  const found = manifestTexts(forgotten).flatMap(({ path, value, max }) =>
    problems(value, path, max),
  );
  assert.deepEqual(found, [
    'manifest.scene_actions[1].fields[0].label has [en,fr,es], expected exactly [en,fr,de,es]',
  ]);
});

test('points are counted in words: singular, plural, half points', async () => {
  const { points } = await import('../src/i18n.js');
  assert.deepEqual(
    [points('en', 1), points('en', 0.5), points('fr', 1), points('fr', 0.5), points('fr', 25)],
    ['1 point', '0.5 points', '1 point', '0,5 point', '25 points'],
  );
  assert.deepEqual(
    [points('de', 1), points('de', 18, { dative: true }), points('es', 1), points('es', 2.5)],
    ['1 Punkt', '18 Punkten', '1 punto', '2,5 puntos'],
  );
});
