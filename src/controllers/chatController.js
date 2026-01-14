import Chat from '../models/Chat.js';
import { getChatResponse, generateChatTitle } from '../services/llmService.js';
import { randomUUID } from 'crypto';

/**
 * Send a message and get AI response
 */
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, model = 'openai' } = req.body;
    const userId = req.auth?.userId;

    // Validate input
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    if (!['openai', 'gemini'].includes(model)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid model. Use "openai" or "gemini"'
      });
    }

    // Find or create chat session
    let chat = null;
    if (sessionId) {
      chat = await Chat.findOne({ userId, sessionId });
    }

    if (!chat) {
      // Create new session if sessionId not provided or not found
      const newSessionId = sessionId || randomUUID();
      chat = new Chat({
        userId,
        sessionId: newSessionId,
        title: null,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      model
    });

    // Get last 10 messages for context (excluding the current user message)
    const contextMessages = chat.messages
      .slice(-11, -1) // Get last 10 messages before current
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Add current user message
    contextMessages.push({
      role: 'user',
      content: message
    });

    // Get AI response
    const aiResponse = await getChatResponse(model, contextMessages);

    // Generate title once when we have the first user message
    if (!chat.title) {
      try {
        const maybeTitle = await generateChatTitle(model, chat.messages);
        if (maybeTitle) chat.title = maybeTitle;
      } catch (e) {
        // Non-fatal
      }
    }

    // Add assistant response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      model
    });

    // Save to database
    await chat.save();

    res.json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        response: aiResponse,
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: chat.messages[chat.messages.length - 1].timestamp,
          model
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message'
    });
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { sessionId } = req.query;

    if (!userId) {
      return res.json({
        success: true,
        data: {
          sessionId: null,
          title: null,
          messages: []
        }
      });
    }

    const query = { userId };
    if (sessionId) query.sessionId = sessionId;

    const chat = await Chat.findOne(query).sort({ updatedAt: -1 });
    if (!chat) {
      return res.json({
        success: true,
        data: {
          sessionId: null,
          title: null,
          messages: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        title: chat.title || null,
        messages: chat.messages
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get chat history'
    });
  }
};

/**
 * Create a new chat session
 */
export const createNewSession = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const sessionId = randomUUID();
    const chat = new Chat({
      userId,
      sessionId,
      title: null,
      messages: []
    });

    await chat.save();

    res.json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session'
    });
  }
};

/**
 * List all chat sessions for current user (for sidebar)
 */
export const listSessions = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const chats = await Chat.find({ userId })
      .select('sessionId title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: {
        chats: chats.map(c => ({
          sessionId: c.sessionId,
          title: c.title,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('List sessions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list chats' });
  }
};
