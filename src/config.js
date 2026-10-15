// -----------------------------------------------------------------------------
// Configuration: DEFAULT_CONFIG mirrors the manifest defaults (tied by
// test/manifest.test.js), and normalizeConfig() turns whatever Gladys sends
// (a field never saved is absent) into a complete, valid object. Nothing here
// throws.
// -----------------------------------------------------------------------------

export const LANGUAGES = ['en', 'fr', 'de', 'es'];

export const DEFAULT_CONFIG = {
  language: 'fr',
  favorite_driver: '',
  favorite_team: '',
};

/**
 * @param {object} [raw] the configuration sent by Gladys
 * @returns {object} DEFAULT_CONFIG's keys with valid values
 */
export function normalizeConfig(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    language: LANGUAGES.includes(source.language) ? source.language : DEFAULT_CONFIG.language,
    favorite_driver: text(source.favorite_driver).slice(0, 60),
    favorite_team: text(source.favorite_team).slice(0, 60),
  };
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** A name compared without case, accents nor punctuation: "Red Bull" = "red_bull". */
export function foldName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}
