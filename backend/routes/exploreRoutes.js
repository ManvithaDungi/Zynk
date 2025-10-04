const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Get trending posts
router.get('/posts', authenticateToken, async (req, res) => {
  try {

    const trendingPosts = await posts
      .aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $limit: 20 },
        { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        {
          $project: {
            content: 1,
            images: 1,
            likes: 1,
            comments: 1,
            createdAt: 1,
            updatedAt: 1,
            'author.username': 1,
            'author.avatar': 1,
            'author.isVerified': 1,
          },
        },
      ])
      .toArray();

    const formattedPosts = trendingPosts.map((post) => ({
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
      updatedAt: post.updatedAt,
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trending users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const db = client.db('zynk');
    const users = db.collection('users');

    const trendingUsers = await users
      .aggregate([
        { $match: { _id: { $ne: new ObjectId(req.user.userId) } } },
        { $addFields: { followersCount: { $size: { $ifNull: ['$followers', []] } } } },
        { $sort: { followersCount: -1, createdAt: -1 } },
        { $limit: 20 },
        {
          $project: {
            username: 1,
            avatar: 1,
            bio: 1,
            followers: 1,
            following: 1,
            postsCount: 1,
            isVerified: 1,
            isPrivate: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    const formattedUsers = trendingUsers.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
      bio: user.bio || '',
      followers: user.followers || [],
      following: user.following || [],
      postsCount: user.postsCount || 0,
      isVerified: user.isVerified || false,
      isPrivate: user.isPrivate || false,
      createdAt: user.createdAt,
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get trending users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trending content (combined)
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const users = db.collection('users');

    // Get trending posts
    const trendingPosts = await posts
      .aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $limit: 10 },
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
      ])
      .toArray();

    // Get trending users
    const trendingUsers = await users
      .aggregate([
        { $match: { _id: { $ne: new ObjectId(req.user.userId) } } },
        { $addFields: { followersCount: { $size: { $ifNull: ['$followers', []] } } } },
        { $sort: { followersCount: -1, createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            username: 1,
            avatar: 1,
            bio: 1,
            followers: 1,
            postsCount: 1,
            isVerified: 1,
          },
        },
      ])
      .toArray();

    const formattedPosts = trendingPosts.map((post) => ({
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
    }));

    const formattedUsers = trendingUsers.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
      bio: user.bio || '',
      followers: user.followers || [],
      postsCount: user.postsCount || 0,
      isVerified: user.isVerified || false,
    }));

    res.json({ 
      posts: formattedPosts,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
