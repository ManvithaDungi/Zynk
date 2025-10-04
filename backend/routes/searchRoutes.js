const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Search users and posts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query?.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }


    const searchRegex = new RegExp(query.trim(), 'i');

    // Search users
    const userResults = await users
      .find({ 
        $or: [
          { username: searchRegex }, 
          { bio: searchRegex }
        ]
      })
      .limit(10)
      .toArray();

    // Search posts
    const postResults = await posts
      .aggregate([
        { $match: { content: searchRegex } },
        { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        {
          $project: {
            content: 1,
            images: 1,
            likes: 1,
            comments: 1,
            createdAt: 1,
            'author.username': 1,
            'author.avatar': 1,
            'author.isVerified': 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    const results = [
      ...userResults.map((userResult) => ({
        type: 'user',
        id: userResult._id.toString(),
        username: userResult.username,
        avatar: userResult.avatar,
        bio: userResult.bio || '',
        followers: userResult.followers || [],
        isVerified: userResult.isVerified || false,
      })),
      ...postResults.map((post) => ({
        type: 'post',
        id: post._id.toString(),
        content: post.content,
        images: post.images || [],
        author: {
          id: post.author._id.toString(),
          username: post.author.username,
          avatar: post.author.avatar,
          isVerified: post.author.isVerified || false,
        },
        likes: post.likes || [],
        comments: post.comments || 0,
        createdAt: post.createdAt,
      })),
    ];

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
