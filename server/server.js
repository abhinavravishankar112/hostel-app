const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hostel App API is running');
});

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  console.log(`User connected: ${userId}`);

  socket.join(userId);

  socket.on('send_message', async (data) => {
    const { to, content } = data;
    if (!to || !content?.trim()) return;

    try {
      const message = await Message.create({
        from: userId,
        to,
        content: content.trim()
      });

      io.to(to).emit('receive_message', message);
      socket.emit('message_sent', message);
    } catch (err) {
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));