import { asyncHandler } from '../utils/asyncHandler.js';
import { processSpeech } from '../services/speechService.js';

export const postSpeechProcess = asyncHandler(async (req, res) => {
  let file = req.file;
  const { targetLanguage, audioBase64, mimeType } = req.body || {};

  if (!file && audioBase64) {
    const buf = Buffer.from(String(audioBase64), 'base64');
    file = {
      buffer: buf,
      originalname: 'upload.bin',
      mimetype: mimeType || 'application/octet-stream',
    };
  }

  if (!file?.buffer) {
    return res.status(400).json({
      error: 'Provide multipart field "audio" or JSON body { audioBase64, mimeType? }',
    });
  }

  const result = await processSpeech({
    file,
    targetLanguage: targetLanguage || null,
  });

  res.json(result);
});
