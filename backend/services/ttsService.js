import { createOpenAIClient } from './openaiHttp.js';
import { normalizeLanguageCode } from '../constants/languages.js';
import { AppError } from '../utils/errors.js';

const TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
const DEFAULT_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';

/** Optional hint: pick a voice; OpenAI voices are fixed set — we map by rough locale feel */
const LANGUAGE_VOICE_HINT = {
  english: 'alloy',
  twi: 'nova',
  ga: 'shimmer',
  ewe: 'echo',
  fante: 'nova',
  hausa: 'onyx',
};

/**
 * Synthesize speech via OpenAI TTS. Returns MP3 bytes.
 */
export async function synthesizeSpeech({ text, language }) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    throw new AppError('text is required', 400);
  }

  const lang = language ? normalizeLanguageCode(language) : null;
  const voice =
    (lang && LANGUAGE_VOICE_HINT[lang]) || DEFAULT_VOICE;

  const client = createOpenAIClient();

  const { data } = await client.post(
    '/audio/speech',
    {
      model: TTS_MODEL,
      voice,
      input: trimmed,
      response_format: 'mp3',
    },
    { responseType: 'arraybuffer' },
  );

  if (!data || !(data instanceof ArrayBuffer || Buffer.isBuffer(data))) {
    throw new AppError('TTS returned no audio data', 502);
  }

  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return { buffer, mimeType: 'audio/mpeg', voice };
}
