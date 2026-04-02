import jwt from 'jsonwebtoken';
import Room from '../models/Room.js';

const socketHandler = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: No token provided'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ User Connected: ${socket.user.username} (${socket.id})`);

    socket.on('join_room', async ({ roomId }) => {
  try {
    let room = await Room.findOne({ roomId });

    if (!room) {
      socket.emit('room_error', { message: 'Room does not exist.' });
      return;
    }

    await Room.findOneAndUpdate(
      { roomId },
      { $pull: { participants: { userId: String(socket.user.id) } } }
    );

    room = await Room.findOne({ roomId });

    const role = room.participants.length === 0 ? 'Host' : 'Participant';
    room = await Room.findOneAndUpdate(
      { roomId },
      {
        $push: {
          participants: {
            userId: String(socket.user.id),
            socketId: socket.id,
            username: socket.user.username,
            role,
          },
        },
      },
      { new: true }
    );

    socket.join(roomId);
    socket.emit('me', { userId: socket.user.id });
    io.to(roomId).emit('user_joined', { participants: room.participants });
    socket.emit('sync_state', room.videoState);

  } catch (err) {
    console.error('Join Room Error:', err);
  }
});

    socket.on('play', async ({ roomId, currentTime }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        // ✅ Check by userId not socketId (socketId can be stale)
        const user = getUserById(room, socket.user.id);
        if (!canControl(user)) {
          console.log(`🚫 ${socket.user.username} tried to play but is ${user?.role}`);
          return;
        }

        const updated = await Room.findOneAndUpdate(
          { roomId },
          { $set: { 'videoState.playing': true, 'videoState.currentTime': currentTime } },
          { new: true }
        );

        socket.to(roomId).emit('play', { currentTime });
        socket.to(roomId).emit('sync_state', updated.videoState);
      } catch (err) {
        console.error('Play Error:', err);
      }
    });

    socket.on('pause', async ({ roomId, currentTime }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        // ✅ Check by userId
        const user = getUserById(room, socket.user.id);
        if (!canControl(user)) {
          console.log(`🚫 ${socket.user.username} tried to pause but is ${user?.role}`);
          return;
        }

        const updated = await Room.findOneAndUpdate(
          { roomId },
          { $set: { 'videoState.playing': false, 'videoState.currentTime': currentTime } },
          { new: true }
        );

        socket.to(roomId).emit('pause', { currentTime });
        socket.to(roomId).emit('sync_state', updated.videoState);
      } catch (err) {
        console.error('Pause Error:', err);
      }
    });

    socket.on('change_video', async ({ roomId, videoId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        const user = getUserById(room, socket.user.id);
        if (!canControl(user)) {
          console.log(`🚫 ${socket.user.username} tried to change video but is ${user?.role}`);
          return;
        }

        const updated = await Room.findOneAndUpdate(
          { roomId },
          { $set: { videoState: { videoId, currentTime: 0, playing: true } } },
          { new: true }
        );

        io.to(roomId).emit('video_changed', { videoId });
        io.to(roomId).emit('sync_state', updated.videoState);
      } catch (err) {
        console.error('Change Video Error:', err);
      }
    });

    socket.on('kick_user', async ({ roomId, targetUserId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        const requester = getUserById(room, socket.user.id);
        if (requester?.role !== 'Host') {
          console.log(`🚫 ${socket.user.username} tried to kick but is not Host`);
          return;
        }

        if (String(targetUserId) === String(socket.user.id)) {
          console.log('🚫 Host tried to kick themselves');
          return;
        }

        const target = room.participants.find(
          (p) => String(p.userId) === String(targetUserId)
        );

        if (!target) {
          console.log('🚫 Target user not found in room');
          return;
        }

        const updated = await Room.findOneAndUpdate(
          { roomId },
          { $pull: { participants: { userId: String(targetUserId) } } },
          { new: true }
        );

        io.to(target.socketId).emit('kicked');

        const targetSocket = io.sockets.sockets.get(target.socketId);
        if (targetSocket) {
          targetSocket.leave(roomId);
        }

        io.to(roomId).emit('user_left', { participants: updated.participants });

        console.log(`👢 ${socket.user.username} kicked ${target.username} from ${roomId}`);
      } catch (err) {
        console.error('Kick Error:', err);
      }
    });
socket.on('end_room', async ({ roomId }) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;

    const requester = getUserById(room, socket.user.id);
    if (requester?.role !== 'Host') {
      console.log(`🚫 ${socket.user.username} tried to end room but is not Host`);
      return;
    }

    io.to(roomId).emit('room_ended');

    await Room.findOneAndDelete({ roomId });

    console.log(`🔚 Room ${roomId} ended by ${socket.user.username}`);
  } catch (err) {
    console.error('End Room Error:', err);
  }
});

socket.on('leave_room', async ({ roomId }) => {
  try {
    const room = await Room.findOneAndUpdate(
      { roomId },
      { $pull: { participants: { userId: String(socket.user.id) } } },
      { new: true }
    );

    if (!room) return;

    socket.leave(roomId);

    if (room.participants.length === 0) {
      await Room.findOneAndDelete({ roomId });
      console.log(`🗑️ Room ${roomId} deleted — no participants left`);
      return;
    }

    if (!room.participants.some((p) => p.role === 'Host')) {
      room.participants[0].role = 'Host';
      await room.save();
    }

    io.to(roomId).emit('user_left', { participants: room.participants });
    console.log(`🚶 ${socket.user.username} left room: ${roomId}`);
  } catch (err) {
    console.error('Leave Room Error:', err);
  }
});
socket.on('send_message', ({ roomId, message }) => {
  if (!message?.trim()) return;

  const chatMessage = {
    userId: socket.user.id,
    username: socket.user.username,
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  console.log(`💬 ${socket.user.username}: ${message}`);

  io.to(roomId).emit('receive_message', chatMessage);
});

    socket.on('disconnecting', async () => {
      const rooms = [...socket.rooms].filter((r) => r !== socket.id);

      for (const roomId of rooms) {
        try {
          const room = await Room.findOneAndUpdate(
            { roomId },
            { $pull: { participants: { socketId: socket.id } } },
            { new: true }
          );

          if (!room) continue;

          if (
            room.participants.length > 0 &&
            !room.participants.some((p) => p.role === 'Host')
          ) {
            room.participants[0].role = 'Host';
            await room.save();
          }

          io.to(roomId).emit('user_left', { participants: room.participants });
          console.log(`🏃 ${socket.user.username} left room: ${roomId}`);
        } catch (err) {
          console.error('Disconnect Error:', err);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User Disconnected: ${socket.id}`);
    });
  });
};


function getUserById(room, userId) {
  return room.participants.find(
    (p) => String(p.userId) === String(userId)
  );
}

function canControl(user) {
  return user && (user.role === 'Host' || user.role === 'Moderator');
}

export default socketHandler;