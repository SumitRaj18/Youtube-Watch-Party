import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://watch-party-backend-hvyo.onrender.com';

const getToken = () => localStorage.getItem('token');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  auth: {
    token: getToken(), 
  },
});

export const connectSocket = () => {
  if (!socket.connected) {
    // ✅ Refresh token in case it changed after login
    socket.auth = { token: getToken() };
    console.log('🔌 Connecting to:', SOCKET_URL);
    socket.connect();
  }
};