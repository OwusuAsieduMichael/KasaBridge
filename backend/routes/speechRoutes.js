import { Router } from 'express';
import multer from 'multer';
import { postSpeechProcess } from '../controllers/speechController.js';
import { validateBody } from '../middleware/validate.js';
import { normalizeLanguageCode, SUPPORTED_LANGUAGE_CODES } from '../constants/languages.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

const optionalTarget = validateBody({
  targetLanguage: (v, body) => {
    if (v === undefined || v === null || v === '') return null;
    if (typeof v !== 'string' || !normalizeLanguageCode(v)) {
      return `targetLanguage must be one of: ${SUPPORTED_LANGUAGE_CODES.join(', ')}`;
    }
    return null;
  },
  audioBase64: () => null,
  mimeType: () => null,
});

// Multer first so multipart text fields (e.g. targetLanguage) populate req.body
router.post('/process', upload.single('audio'), optionalTarget, postSpeechProcess);

export default router;
