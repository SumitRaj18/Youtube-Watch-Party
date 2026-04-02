import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';

export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    
    next(err); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success:true,
      token, 
      username: user.username,
      id: user._id 
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};