import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io('https://bask-backend.onrender.com', {
    withCredentials: true, // This sends cookies automatically!
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}