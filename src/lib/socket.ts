import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/api/auth';

let socket: Socket | null = null;
let connectionPromise: Promise<Socket | null> | null = null;

export async function getSocket(): Promise<Socket | null> {
  // If already connecting, return the promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // If socket already exists and is connected, return it
  if (socket?.connected) {
    return socket;
  }

  connectionPromise = (async () => {
    try {
      // Fetch token FIRST
      console.log('Fetching token for socket...');
      const token = getAuthToken();
      console.log("Token fetched:", token); 
      
      if (!token) {
        console.error('No auth token available');
        connectionPromise = null;
        return null;
      }

      console.log('Token retrieved:', token ? 'Token exists' : 'No token');

      // If socket exists but disconnected, try to reconnect with new token
      if (socket && !socket.connected) {
        console.log('Socket exists but disconnected, attempting reconnect with new token...');
        socket.auth = { token };
        socket.connect();
        return socket;
      }

      console.log('Creating new socket connection...');

      // Create new socket connection
      socket = io('https://bask-backend.onrender.com', {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Socket connected! ID:', socket?.id);
        connectionPromise = null;
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        connectionPromise = null;
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        connectionPromise = null;
        
        // Clear local storage token if auth error
        if (error.message.includes('Authentication') || error.message.includes('auth')) {
          localStorage.removeItem('authToken');
          console.log('Cleared invalid auth token');
        }
      });

      return socket;
    } catch (error) {
      console.error('Error in getSocket:', error);
      connectionPromise = null;
      return null;
    }
  })();

  return connectionPromise;
}

export async function connectSocket(): Promise<Socket | null> {
  return await getSocket();
}

export function disconnectSocket() {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
  connectionPromise = null;
}

export async function reconnectSocket(): Promise<Socket | null> {
  disconnectSocket();
  return await getSocket();
}