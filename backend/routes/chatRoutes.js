import { Router } from 'express';
import { postAiChat } from '../controllers/chatController.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post(
  '/chat',
  validateBody({
    messages: (v) => {
      if (!Array.isArray(v) || v.length === 0) return 'messages must be a non-empty array';
      return null;
    },
  }),
  postAiChat,
);

export default router;
