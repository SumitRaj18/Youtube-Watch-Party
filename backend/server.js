import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './confilg/db.js'; 
import authRouter from './routes/auth.js';
import roomRouter from './routes/room.js';
import socketHandler from './socket/SocketHandler.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// API Routes 
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomRouter);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});