import dotenv from 'dotenv';

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d', 
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
};

const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
  ];
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Warning: Missing required environment variables:');
    missing.forEach(key => {
      console.warn(`   - ${key}`);
    });
    console.warn('\n💡 Some features may not work without these variables.\n');
  }
};

if (env.NODE_ENV !== 'test') {
  validateEnv();
}

export default env;
