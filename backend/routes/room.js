import express from 'express'
const router = express.Router();
import auth from '../middleware/auth.js'; 
import { createRoom, getRoomDetails } from '../controllers/room.js';


router.post('/create', auth, createRoom);

router.get('/:roomId', auth, getRoomDetails);

export default router;