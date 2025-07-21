const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const leaveRoutes = require('./routes/leaves');
const attendanceRoutes = require('./routes/attendance');
const meetingRoutes = require('./routes/meetings');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

// 🔧 Fix CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://employee-on-boarding-system.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 🌐 Enable CORS for API routes
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://employee-on-boarding-system.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 📦 MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dheerajgaurcs23:dheerajgaurcs23@cluster0.9gslzuz.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// ⚡ Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// 🌍 Make io available in routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🛣️ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// 🔗 Root route
app.get('/', (req, res) => {
  res.send('✅ Employee Onboarding System Backend is Running!');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
