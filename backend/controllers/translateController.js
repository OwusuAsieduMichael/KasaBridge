import { asyncHandler } from '../utils/asyncHandler.js';
import { runTranslation } from '../services/translationService.js';

export const postTranslate = asyncHandler(async (req, res) => {
  const { text, targetLanguage } = req.body;
  const result = await runTranslation({ text, targetLanguage });
  res.json({
    sourceLanguage: result.sourceLanguage,
    translatedText: result.translatedText,
  });
});
