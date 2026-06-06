const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const socialRoutes = require('./routes/socialRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { setSocketInstance } = require('./controllers/socialController'); // ← add

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true }
});

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.send('DevConnect backend is running'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const onlineUsers = new Map();

// ← Inject socket into socialController after io is created
setSocketInstance(io, onlineUsers);

io.on('connection', (socket) => {
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, text, jobRef } = data;
    const Message = require('./models/Message');
    const message = new Message({ senderId, receiverId, text, jobRef: jobRef || null });
    await message.save();
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', message);
    socket.emit('receiveMessage', message);
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { senderId });
  });

  socket.on('stopTyping', ({ senderId, receiverId }) => {
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
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log('Connected to MongoDB');
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));