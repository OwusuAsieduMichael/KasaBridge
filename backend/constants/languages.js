/**
 * Strict allow-list for KasaBridge AI (no other languages).
 * API accepts these canonical codes (case-insensitive).
 */
export const SUPPORTED_LANGUAGE_CODES = [
  'english',
  'twi',
  'ga',
  'ewe',
  'fante',
  'hausa',
];

/** Display / prompt names for the LLM */
export const LANGUAGE_LABELS = {
  english: 'English',
  twi: 'Twi (Akan)',
  ga: 'Ga',
  ewe: 'Ewe',
  fante: 'Fante',
  hausa: 'Hausa',
};

export function normalizeLanguageCode(input) {
  if (input == null || typeof input !== 'string') return null;
  const key = input.trim().toLowerCase();
  if (SUPPORTED_LANGUAGE_CODES.includes(key)) return key;
  return null;
}

export function isSupportedLanguage(code) {
  return normalizeLanguageCode(code) !== null;
}

export function labelForCode(code) {
  const c = normalizeLanguageCode(code);
  return c ? LANGUAGE_LABELS[c] : null;
}
