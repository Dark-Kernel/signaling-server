const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Handle signaling events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle offer
  socket.on('offer', (offer, to) => {
    console.log('Offer from', socket.id);
    io.to(to).emit('offer', offer, socket.id);
  });

  // Handle answer
  socket.on('answer', (answer, to) => {
    io.to(to).emit('answer', answer, socket.id);
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (candidate, to) => {
    io.to(to).emit('ice-candidate', candidate, socket.id);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Signaling server running on port ${port}`);
});

