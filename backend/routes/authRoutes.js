const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticateToken, generateToken } = require('../utils/jwtAuth');
const { isValidEmail, isValidPassword, sanitizeString } = require('../utils/validation');

const router = express.Router();

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
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeString(username);
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address'
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters and contain at least one letter and one number'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email: sanitizedEmail }, { name: sanitizedUsername }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = new User({
      name: sanitizedUsername,
      email: sanitizedEmail,
      password,
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
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
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
        role: user.role
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
    const user = await User.findById(req.user.userId).select('-password');
    
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
        role: user.role,
        followers: user.followers || [],
        following: user.following || [],
        postsCount: user.postsCount || 0,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        lastLogin: user.lastLogin,
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