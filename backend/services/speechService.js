import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createOpenAIClient } from './openaiHttp.js';
import { runTranslation } from './translationService.js';
import { normalizeLanguageCode } from '../constants/languages.js';
import { AppError } from '../utils/errors.js';

const WHISPER_MODEL = process.env.OPENAI_WHISPER_MODEL || 'whisper-1';

/** Map Whisper ISO codes to our canonical codes where possible */
const WHISPER_TO_CANONICAL = {
  en: 'english',
  tw: 'twi',
  ak: 'twi',
  ee: 'ewe',
  ha: 'hausa',
};

function mapWhisperLanguage(whisperLang) {
  if (!whisperLang || typeof whisperLang !== 'string') return null;
  const key = whisperLang.toLowerCase().slice(0, 2);
  return WHISPER_TO_CANONICAL[key] || null;
}

/**
 * Refine Whisper-detected language into one of our six using the chat model (minimal call).
 */
async function classifySupportedLanguage(transcript) {
  const client = createOpenAIClient();
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
  const { data } = await client.post('/chat/completions', {
    model,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `Classify the language of the user text. Reply with JSON only: {"language":"english|twi|ga|ewe|fante|hausa"}. Only these six values are valid.`,
      },
      { role: 'user', content: transcript },
    ],
  });
  const content = data?.choices?.[0]?.message?.content?.trim() || '';
  let text = content;
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) text = fence[1].trim();
  try {
    const parsed = JSON.parse(text);
    return normalizeLanguageCode(parsed.language);
  } catch {
    return null;
  }
}

/**
 * Transcribe audio buffer with OpenAI Whisper.
 * @param {{ buffer: Buffer, originalname?: string, mimetype?: string }} file
 */
export async function transcribeAudioFile(file) {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new AppError('Audio file buffer is required', 400);
  }

  const client = createOpenAIClient();
  const ext = path.extname(file.originalname || '') || '.webm';
  const tmp = path.join(os.tmpdir(), `kasabridge-${Date.now()}${ext}`);

  await fs.promises.writeFile(tmp, file.buffer);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(tmp), {
      filename: file.originalname || `audio${ext}`,
      contentType: file.mimetype || 'application/octet-stream',
    });
    form.append('model', WHISPER_MODEL);
    form.append('response_format', 'verbose_json');

    const { data } = await client.post('/audio/transcriptions', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const transcript = typeof data.text === 'string' ? data.text.trim() : '';
    if (!transcript) {
      throw new AppError('No speech detected in audio', 422);
    }

    let sourceLanguage = mapWhisperLanguage(data.language);
    if (!sourceLanguage) {
      sourceLanguage = await classifySupportedLanguage(transcript);
    }
    if (!sourceLanguage) {
      sourceLanguage = 'english';
    }

    return { transcript, sourceLanguage, whisperLanguage: data.language || null };
  } finally {
    await fs.promises.unlink(tmp).catch(() => {});
  }
}

/**
 * Full speech pipeline: STT → optional translation.
 */
export async function processSpeech({ file, targetLanguage }) {
  const stt = await transcribeAudioFile(file);

  const result = {
    transcript: stt.transcript,
    sourceLanguage: stt.sourceLanguage,
    whisperLanguage: stt.whisperLanguage,
  };

  if (targetLanguage) {
    const target = normalizeLanguageCode(targetLanguage);
    if (!target) {
      throw new AppError('Invalid targetLanguage', 400);
    }
    if (target === stt.sourceLanguage) {
      result.translatedText = stt.transcript;
    } else {
      const tr = await runTranslation({
        text: stt.transcript,
        targetLanguage: target,
      });
      result.translatedText = tr.translatedText;
      result.sourceLanguage = tr.sourceLanguage;
    }
  }

  return result;
}
