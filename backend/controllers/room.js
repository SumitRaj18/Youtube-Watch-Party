import Room from "../models/Room.js";


export const createRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      return res.status(400).json({ error: "Room ID already taken" });
    }

    const newRoom = new Room({
      roomId,
      participants: [], 
      videoState: {
        videoId: '',
        playing: false,
        currentTime: 0
      }
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    console.error("Create Room Error:", err.message);
    res.status(400).json({ error: "Invalid data or validation failed" });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};