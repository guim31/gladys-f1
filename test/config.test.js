// -----------------------------------------------------------------------------
// The configuration as Gladys sends it: fields never saved are absent, and a
// wrong entry falls back to the default, never thrown.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG, foldName, normalizeConfig } from '../src/config.js';

test('an empty configuration gives the defaults', () => {
  assert.deepEqual(normalizeConfig({}), DEFAULT_CONFIG);
  assert.deepEqual(normalizeConfig(null), DEFAULT_CONFIG);
});

test('values are trimmed, unknown languages replaced', () => {
  assert.deepEqual(
    normalizeConfig({ language: 'it', favorite_driver: '  VER ', favorite_team: 42 }),
    { language: 'fr', favorite_driver: 'VER', favorite_team: '' },
  );
});

test('names are compared without case, accents nor punctuation', () => {
  assert.equal(foldName('Sergio Pérez'), foldName('sergio_perez'));
  assert.equal(foldName('Red Bull'), 'redbull');
});
