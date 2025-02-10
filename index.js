import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

// Active users tracking
const users = new Set();

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Add user to active users
  users.add(socket.id);
  
  // Broadcast updated user list to all clients
  io.emit('users-update', Array.from(users));

  // WebRTC Signaling Events
  socket.on('offer', (offer, toId) => {
    console.log(`Offer from ${socket.id} to ${toId}`);
    socket.to(toId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, toId) => {
    console.log(`Answer from ${socket.id} to ${toId}`);
    socket.to(toId).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (candidate, toId) => {
    console.log(`ICE candidate from ${socket.id} to ${toId}`);
    socket.to(toId).emit('ice-candidate', candidate, socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    users.delete(socket.id);
    io.emit('users-update', Array.from(users));
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'active', 
    connectedUsers: users.size 
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
