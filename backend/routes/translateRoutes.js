import { Router } from 'express';
import { postTranslate } from '../controllers/translateController.js';
import { validateBody } from '../middleware/validate.js';
import { normalizeLanguageCode, SUPPORTED_LANGUAGE_CODES } from '../constants/languages.js';

const router = Router();

router.post(
  '/',
  validateBody({
    text: (v) => {
      if (v == null || typeof v !== 'string' || !v.trim()) return 'text must be a non-empty string';
      return null;
    },
    targetLanguage: (v) => {
      if (v == null || typeof v !== 'string' || !v.trim()) return 'targetLanguage is required';
      if (!normalizeLanguageCode(v)) {
        return `targetLanguage must be one of: ${SUPPORTED_LANGUAGE_CODES.join(', ')}`;
      }
      return null;
    },
  }),
  postTranslate,
);

export default router;
