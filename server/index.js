// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config(); // Load .env first

// 🛣️ Import Routes
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

// 🌐 CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',') // comma-separated in .env
  : ["http://localhost:5173", "https://employee-on-boarding-system.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 🔧 Middlewares
app.use(express.json());
app.use('/uploads', express.static('uploads')); // make sure 'uploads/' exists

// ⚡ Socket.IO Integration
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// 📦 MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1); // Stop if DB connection fails
});

// 🌍 Inject io into all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🛣️ Use API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// 🔗 Root Check
app.get('/', (req, res) => {
  res.send('✅ Employee Onboarding System Backend is Running!');
});

// ❗ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
