import OpenAI from 'openai';
import env from '../config/environment.js';

// Lazy-loaded clients (initialized only when needed)
let openai = null;

/**
 * Get OpenAI client (lazy initialization)
 */
const getOpenAIClient = () => {
  if (!openai) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }
  return openai;
};

/**
 * Chat with OpenAI GPT
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - AI response
 */
export const chatWithOpenAI = async (messages) => {
  try {
    const openaiClient = getOpenAIClient();

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    if (error.status === 500 || error.status === 503) {
      throw new Error('OpenAI API is temporarily unavailable. Please try again later.');
    }
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
};

/**
 * Chat with Google Gemini using direct REST API
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - AI response
 */
export const chatWithGemini = async (messages) => {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Use gemini-2.5-flash-lite (working model) or configurable via env
    const modelName = env.GEMINI_MODEL;
    const apiKey = env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Convert messages to Gemini format
    // Get the last user message and build context from previous messages
    const contents = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    const payload = {
      contents: contents
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = { data: errorData };
      throw error;
    }

    const data = await response.json();

    if (!data || !data.candidates || !data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Handle specific Gemini errors
    if (error.response?.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.');
    }
    if (error.response?.status === 429) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    if (error.response?.status === 404) {
      throw new Error(`Gemini model not found. Model: ${env.GEMINI_MODEL}. Check available models at https://ai.google.dev/models/gemini`);
    }
    if (error.response?.data?.error) {
      throw new Error(`Gemini API Error: ${error.response.data.error.message || error.response.data.error}`);
    }
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};

export const getChatResponse = async (model, messages) => {
  if (model === 'openai') {
    return await chatWithOpenAI(messages);
  } else if (model === 'gemini') {
    return await chatWithGemini(messages);
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
};

export const generateChatTitle = async (model, messages) => {
  const userText = (messages || [])
    .filter(m => m?.role === 'user' && typeof m?.content === 'string')
    .map(m => m.content.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join('\n');

  // Fallback if we don't have enough context
  if (!userText) return 'New Chat';

  const prompt = [
    { role: 'system', content: 'You generate concise chat titles.' },
    {
      role: 'user',
      content:
        'Create a short title (max 6 words, no quotes, no emoji). Base it on:\n' + userText
    }
  ];

  const raw = await getChatResponse(model, prompt);
  return String(raw || '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'New Chat';
};
