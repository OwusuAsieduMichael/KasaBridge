import { createOpenAIClient } from './openaiHttp.js';
import { SUPPORTED_LANGUAGE_CODES } from '../constants/languages.js';
import { AppError } from '../utils/errors.js';

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are KasaBridge AI, a helpful assistant focused on Ghanaian languages and culture.
You only discuss or use these languages: ${SUPPORTED_LANGUAGE_CODES.join(', ')}.
Be concise, accurate, and respectful. If asked about unsupported languages, explain that this product only supports the six Ghanaian-focused languages listed.`;

/**
 * Optional helper chat for UX (e.g. usage tips, cultural context).
 */
export async function runChat({ messages }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError('messages array is required', 400);
  }

  const sanitized = messages
    .filter((m) => m && typeof m.role === 'string' && typeof m.content === 'string')
    .map((m) => ({
      role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
      content: m.content.slice(0, 12000),
    }));

  if (sanitized.length === 0) {
    throw new AppError('No valid messages', 400);
  }

  const client = createOpenAIClient();

  const { data } = await client.post('/chat/completions', {
    model: CHAT_MODEL,
    temperature: 0.5,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized],
  });

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new AppError('Empty assistant response', 502);
  }

  return { reply };
}
