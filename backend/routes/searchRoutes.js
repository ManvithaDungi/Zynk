const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');
const { sanitizeString } = require('../utils/validation');

const router = express.Router();

// Search users and posts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q: query, type = 'all', page = 1, limit = 10 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const sanitizedQuery = sanitizeString(query);
    const skip = (page - 1) * limit;

    let results = { users: [], posts: [] };

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { name: { $regex: sanitizedQuery, $options: 'i' } },
          { email: { $regex: sanitizedQuery, $options: 'i' } }
        ]
      })
        .select('name email avatar bio followers following postsCount isVerified')
        .limit(parseInt(limit))
        .skip(skip);

      results.users = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: user.postsCount,
        isVerified: user.isVerified
      }));
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        caption: { $regex: sanitizedQuery, $options: 'i' }
      })
        .populate('user', 'name email avatar')
        .populate('album', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      results.posts = posts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        createdAt: post.createdAt
      }));
    }

    res.json({
      query: sanitizedQuery,
      results,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search users only
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const sanitizedQuery = sanitizeString(query);
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { name: { $regex: sanitizedQuery, $options: 'i' } },
        { email: { $regex: sanitizedQuery, $options: 'i' } }
      ]
    })
      .select('name email avatar bio followers following postsCount isVerified')
      .sort({ followers: -1, postsCount: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: sanitizedQuery, $options: 'i' } },
        { email: { $regex: sanitizedQuery, $options: 'i' } }
      ]
    });

    res.json({
      query: sanitizedQuery,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: user.postsCount,
        isVerified: user.isVerified
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search posts only
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const sanitizedQuery = sanitizeString(query);
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      caption: { $regex: sanitizedQuery, $options: 'i' }
    })
      .populate('user', 'name email avatar')
      .populate('album', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({
      caption: { $regex: sanitizedQuery, $options: 'i' }
    });

    res.json({
      query: sanitizedQuery,
      posts: posts.map(post => ({
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
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;