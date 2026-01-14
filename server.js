import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './src/config/environment.js';
import connectDB from './src/config/database.js';
import chatRoutes from './src/routes/chatRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

const app = express();
const PORT = env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve frontend build in production (optional monorepo deploy)
if (env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  // Handle port already in use error
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.log(`\n💡 Solutions:`);
      console.log(`   1. Kill the process using port ${PORT}:`);
      console.log(`      lsof -ti:${PORT} | xargs kill -9`);
      console.log(`   2. Or change the PORT in your .env file`);
      console.log(`   3. Or find and stop the other server process\n`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
