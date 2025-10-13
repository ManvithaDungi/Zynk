/**
 * Combined User Routes
 * Merges all user management endpoints
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/users
 * @desc    Get all users (with optional filters)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select('-password -__v');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/active
 * @desc    Get all active users
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const activeUsers = await User.getActiveUsers();
    
    res.json({
      success: true,
      count: activeUsers.length,
      data: activeUsers
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/search/:query
 * @desc    Search users by username or email
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(20);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Public (but can be enhanced with auth)
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        isActive: user.isActive,
        lastActive: user.lastActive,
        followers: user.followers || [],
        following: user.following || [],
        postsCount: user.postsCount || 0,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (registration without auth)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, username, email, password, status } = req.body;
    
    // Validation
    if (!username || !email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, email, and password'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password, // Will be hashed by pre-save middleware
      status: status || 'offline',
      isActive: false
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// ==================== AUTHENTICATED ROUTES ====================

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile
 * @access  Private
 */
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, username, email, bio, avatar, isPrivate, status, isActive } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    // Check if user is updating their own profile
    if (userId !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only update your own profile' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update fields
    if (name) user.name = sanitizeString(name);
    if (username) user.username = sanitizeString(username);
    if (email) user.email = email;
    if (bio !== undefined) user.bio = sanitizeString(bio);
    if (avatar !== undefined) user.avatar = avatar;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;
    if (status !== undefined) user.status = status;
    if (isActive !== undefined) user.isActive = isActive;
    
    user.lastActive = new Date();

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already taken'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   PATCH /api/users/:userId/status
 * @desc    Update user status (online/offline/away)
 * @access  Public
 */
router.patch('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, isActive } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (status !== undefined) user.status = status;
    if (isActive !== undefined) user.isActive = isActive;
    user.lastActive = new Date();
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'User status updated',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/users/:userId/activate
 * @desc    Activate user (set as online)
 * @access  Public
 */
router.post('/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { socketId } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.setActive(socketId);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'User activated',
      data: userResponse
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/users/:userId/deactivate
 * @desc    Deactivate user (set as offline)
 * @access  Public
 */
router.post('/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.setInactive();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'User deactivated',
      data: userResponse
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

// ==================== SOCIAL FEATURES ====================

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    if (userId === req.user.userId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot follow yourself' 
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.userId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already following this user' 
      });
    }

    currentUser.following.push(userId);
    targetUser.followers.push(req.user.userId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ 
      success: true,
      message: 'Successfully followed user' 
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/users/:userId/unfollow
 * @desc    Unfollow a user
 * @access  Private
 */
router.post('/:userId/unfollow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.userId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.user.userId
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ 
      success: true,
      message: 'Successfully unfollowed user' 
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user followers
 * @access  Private
 */
router.get('/:userId/followers', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(userId)
      .populate('followers', 'name username email avatar')
      .select('followers');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      count: user.followers.length,
      data: user.followers.map(follower => ({
        id: follower._id,
        name: follower.name,
        username: follower.username,
        email: follower.email,
        avatar: follower.avatar
      }))
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get user following
 * @access  Private
 */
router.get('/:userId/following', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(userId)
      .populate('following', 'name username email avatar')
      .select('following');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      count: user.following.length,
      data: user.following.map(following => ({
        id: following._id,
        name: following.name,
        username: following.username,
        email: following.email,
        avatar: following.avatar
      }))
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/users/:userId/posts
 * @desc    Get user posts
 * @access  Private
 */
router.get('/:userId/posts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const posts = await Post.find({ user: userId })
      .populate('user', 'name username email avatar')
      .populate('album', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ user: userId });

    res.json({
      success: true,
      data: posts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        createdAt: post.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    // Check if user is deleting their own account
    if (userId !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own account' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ user: userId })
    ]);

    res.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;