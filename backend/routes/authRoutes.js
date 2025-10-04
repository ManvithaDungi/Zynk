// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Generate Token
const generateToken = (userId, email, username) => {
  return jwt.sign({ userId, email, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many attempts, try again later'
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic field validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { name: username }] });
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      userId: savedUser._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.name);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers || [],
        following: user.following || [],
        postsCount: user.postsCount || 0,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;
