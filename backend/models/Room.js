import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  videoState: {
    videoId: { type: String, default: 'dQw4w9WgXcQ' },
    playing: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 }
  },
  participants: [{
    userId: { type: String, required: true }, 
    socketId: { type: String, required: true }, 
    username: String,
    role: { 
      type: String, 
      enum: ['Host', 'Moderator', 'Participant', 'Viewer'], 
      default: 'Participant' 
    }
  }]
}, { timestamps: true }); 

const Room = mongoose.model('Room', RoomSchema);
export default Room;