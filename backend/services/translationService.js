import { createOpenAIClient } from './openaiHttp.js';
import { labelForCode, normalizeLanguageCode, SUPPORTED_LANGUAGE_CODES } from '../constants/languages.js';
import { AppError } from '../utils/errors.js';
import { insertTranslation } from '../models/translationModel.js';

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

function buildUserPrompt(targetLabel, inputText) {
  return `You are a multilingual Ghanaian language expert.
Translate the text into ${targetLabel}.
Ensure natural, culturally accurate, conversational output.
Maintain conversational tone. Avoid literal translations; translate meaning, not words.

The only supported languages are: ${SUPPORTED_LANGUAGE_CODES.join(', ')}.
Detect the source language of the input (must be one of these).

Respond with valid JSON only (no markdown fences). Use exactly this shape:
{"sourceLanguage":"<one of: english,twi,ga,ewe,fante,hausa>","translatedText":"<translation>"}

Text: ${inputText}`;
}

function parseJsonFromContent(content) {
  if (!content || typeof content !== 'string') {
    throw new AppError('Empty model response', 502);
  }
  let text = content.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) text = fence[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AppError('Model returned invalid JSON', 502);
  }

  const source = normalizeLanguageCode(parsed.sourceLanguage);
  const translated = typeof parsed.translatedText === 'string' ? parsed.translatedText.trim() : '';

  if (!source) {
    throw new AppError('Could not determine a supported source language', 422);
  }
  if (!translated) {
    throw new AppError('Translation result was empty', 502);
  }

  return { sourceLanguage: source, translatedText: translated };
}

/**
 * Core translation: detect source language + translate to target.
 * @param {{ text: string, targetLanguage: string }} params
 */
export async function runTranslation({ text, targetLanguage }) {
  const target = normalizeLanguageCode(targetLanguage);
  if (!target) {
    throw new AppError('Invalid targetLanguage', 400, {
      allowed: SUPPORTED_LANGUAGE_CODES,
    });
  }

  const trimmed = String(text).trim();
  if (!trimmed) {
    throw new AppError('text is required', 400);
  }

  const targetLabel = labelForCode(target);
  const client = createOpenAIClient();

  const userPrompt = buildUserPrompt(targetLabel, trimmed);

  const { data } = await client.post('/chat/completions', {
    model: CHAT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'You output only compact JSON as requested. You never add commentary outside JSON.',
      },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = data?.choices?.[0]?.message?.content;
  const { sourceLanguage, translatedText } = parseJsonFromContent(content);

  try {
    await insertTranslation({
      inputText: trimmed,
      outputText: translatedText,
      sourceLanguage,
      targetLanguage: target,
    });
  } catch (e) {
    // Log but do not fail the API if persistence is unavailable
    console.error('translationModel.insertTranslation failed:', e.message);
  }

  return {
    sourceLanguage,
    translatedText,
  };
}
