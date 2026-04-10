import { asyncHandler } from '../utils/asyncHandler.js';
import { runChat } from '../services/chatService.js';

export const postAiChat = asyncHandler(async (req, res) => {
  const { messages } = req.body || {};
  const result = await runChat({ messages });
  res.json({ reply: result.reply });
});
