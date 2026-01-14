# Backend Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Auth (JWT)
# Use a long random string in production
JWT_SECRET=replace_me_with_a_strong_secret
JWT_EXPIRES_IN=7d

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/chatbot

# For MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot?retryWrites=true&w=majority

# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
# For local development:
FRONTEND_URL=http://localhost:5173

# For production, use your deployed frontend URL:
# FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Quick Setup

1. Copy the content above
2. Create a file named `.env` in the `backend` directory
3. Replace the placeholder values with your actual credentials
4. Save the file

**Important**: Never commit the `.env` file to git. It's already in `.gitignore`.
