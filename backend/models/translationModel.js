import { query } from '../config/database.js';
import { config } from '../config/env.js';

export async function insertTranslation({
  inputText,
  outputText,
  sourceLanguage,
  targetLanguage,
}) {
  if (!config.databaseUrl) return null;

  const result = await query(
    `INSERT INTO translations (input_text, output_text, source_language, target_language)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at`,
    [inputText, outputText, sourceLanguage, targetLanguage],
  );
  return result.rows[0];
}

export async function listRecentTranslations(limit = 50) {
  if (!config.databaseUrl) return [];

  const result = await query(
    `SELECT id, input_text, output_text, source_language, target_language, created_at
     FROM translations
     ORDER BY created_at DESC
     LIMIT $1`,
    [Math.min(Number(limit) || 50, 200)],
  );
  return result.rows;
}
