process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const socialRoutes = require('./routes/socialRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { setSocketInstance } = require('./controllers/socialController');
const errorHandler = require('./middleware/errorHandler');
const sanitizeMiddleware = require('./middleware/sanitize');

dotenv.config();

// Startup validation — ensure critical env vars are present
if (!process.env.JWT_SECRET) {
  console.error('======================================================');
  console.error('FATAL: JWT_SECRET is not set in environment variables!');
  console.error('All authentication will fail with 401 Unauthorized.');
  console.error('Set JWT_SECRET in your Render environment variables.');
  console.error('======================================================');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not set in environment variables!');
  process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
  console.warn('======================================================');
  console.warn('⚠️  WARNING: GROQ_API_KEY is not set in environment variables!');
  console.warn('AI code review feature will be unavailable.');
  console.warn('This is non-critical - the app will continue to run.');
  console.warn('======================================================');
}


// ← Allow all vercel.app URLs + localhost + CLIENT_URL from env
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CLIENT_URL
    ];
    
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        process.env.CLIENT_URL
      ];
      
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json());

// Data sanitization against NoSQL injection
app.use(sanitizeMiddleware);

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes per IP
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: { message: 'Too many AI requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

app.get('/', (req, res) => res.send('DevConnect backend is running'));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);


const onlineUsers = new Map();
setSocketInstance(io, onlineUsers);

io.on('connection', (socket) => {
  socket.on('userOnline', (userId) => {
    // Validate userId is a string and not empty
    if (typeof userId === 'string' && userId.trim()) {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, text, jobRef } = data;
      
      // Validate required fields
      if (!senderId || !receiverId || !text) {
        return; // Ignore invalid messages
      }
      
      // Validate text is a string and within reasonable length
      if (typeof text !== 'string' || text.length > 5000) {
        return;
      }
      
      const Message = require('./models/Message');
      const message = new Message({ 
        senderId, 
        receiverId, 
        text: text.trim(), 
        jobRef: jobRef || null 
      });
      await message.save();
      
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', message);
      socket.emit('receiveMessage', message);
    } catch (error) {
      console.error('Socket message error:', error.message);
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    // Validate input
    if (!senderId || !receiverId) return;
    
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { senderId });
  });

  socket.on('stopTyping', ({ senderId, receiverId }) => {
    // Validate input
    if (!senderId || !receiverId) return;
    
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('userStoppedTyping', { senderId });
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Connected to MongoDB');
    });
  })
  .catch((err) => {
    console.error('startup error:', err.message);
    process.exit(1);
  });