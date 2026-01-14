# Backend API

Express.js backend for the AI Chatbot application.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatbot
JWT_SECRET=replace_me_with_a_strong_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

3. Start server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret to sign JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. 7d) | No |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## API Documentation

See main README.md for API endpoint documentation.
