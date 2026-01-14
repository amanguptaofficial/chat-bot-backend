import express from 'express';
import {
  sendMessage,
  getChatHistory,
  createNewSession,
  listSessions
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat/message - Send a message
router.post('/message', requireAuth, sendMessage);

// GET /api/chat/history - Get chat history
router.get('/history', requireAuth, getChatHistory);

// GET /api/chat/sessions - List all sessions
router.get('/sessions', requireAuth, listSessions);

// POST /api/chat/session - Create new session
router.post('/session', requireAuth, createNewSession);

export default router;
