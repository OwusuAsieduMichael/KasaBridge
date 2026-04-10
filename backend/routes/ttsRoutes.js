import { Router } from 'express';
import { postTtsSpeak } from '../controllers/ttsController.js';
import { validateBody } from '../middleware/validate.js';
import { normalizeLanguageCode, SUPPORTED_LANGUAGE_CODES } from '../constants/languages.js';

const router = Router();

router.post(
  '/speak',
  validateBody({
    text: (v) => {
      if (v == null || typeof v !== 'string' || !v.trim()) return 'text must be a non-empty string';
      return null;
    },
    language: (v) => {
      if (v === undefined || v === null || v === '') return null;
      if (typeof v !== 'string' || !normalizeLanguageCode(v)) {
        return `language must be one of: ${SUPPORTED_LANGUAGE_CODES.join(', ')}`;
      }
      return null;
    },
    format: () => null,
  }),
  postTtsSpeak,
);

export default router;
