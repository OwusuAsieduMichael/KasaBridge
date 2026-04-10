import { asyncHandler } from '../utils/asyncHandler.js';
import { synthesizeSpeech } from '../services/ttsService.js';

export const postTtsSpeak = asyncHandler(async (req, res) => {
  const { text, language, format } = req.body || {};
  const { buffer, mimeType, voice } = await synthesizeSpeech({ text, language });

  if (format === 'json' || req.query.format === 'json') {
    return res.json({
      mimeType,
      voice,
      audioBase64: buffer.toString('base64'),
    });
  }

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
});
