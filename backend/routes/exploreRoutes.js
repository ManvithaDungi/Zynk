const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Get trending posts
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const trendingPosts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ['$likes', []] } },
          commentsCount: { $size: { $ifNull: ['$comments', []] } }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$likesCount', 2] },
              '$commentsCount',
              {
                $divide: [
                  { $subtract: [new Date(), '$createdAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'albums',
          localField: 'album',
          foreignField: '_id',
          as: 'album'
        }
      },
      { $unwind: '$album' },
      {
        $project: {
          _id: 1,
          caption: 1,
          media: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar'
          },
          album: {
            _id: '$album._id',
            name: '$album.name'
          }
        }
      }
    ]);

    res.json({
      posts: trendingPosts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get popular users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const popularUsers = await User.aggregate([
      {
        $addFields: {
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } }
        }
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ['$followersCount', 3] },
              { $multiply: ['$postsCount', 2] },
              '$followingCount'
            ]
          }
        }
      },
      { $sort: { popularityScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          bio: 1,
          followersCount: 1,
          followingCount: 1,
          postsCount: 1,
          isVerified: 1,
          createdAt: 1
        }
      }
    ]);

    res.json({
      users: popularUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get popular users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get recommended content
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recommended posts based on user's interests and following
    const recommendedPosts = await Post.aggregate([
      {
        $match: {
          user: { $nin: currentUser.following }, // Not from followed users
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ['$likes', []] } },
          commentsCount: { $size: { $ifNull: ['$comments', []] } }
        }
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: ['$likesCount', 2] },
              '$commentsCount'
            ]
          }
        }
      },
      { $sort: { engagementScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'albums',
          localField: 'album',
          foreignField: '_id',
          as: 'album'
        }
      },
      { $unwind: '$album' },
      {
        $project: {
          _id: 1,
          caption: 1,
          media: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar'
          },
          album: {
            _id: '$album._id',
            name: '$album.name'
          }
        }
      }
    ]);

    res.json({
      posts: recommendedPosts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    console.error('Get recommended content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;