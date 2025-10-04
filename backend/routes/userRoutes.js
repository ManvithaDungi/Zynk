const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();
const client = new MongoClient(process.env.MONGO_URI);

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
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
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Get user posts
router.get('/:userId/posts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'posts' } = req.query;

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');

    let query = {};
    if (type === 'posts') {
      query = { authorId: new ObjectId(userId) };
    } else if (type === 'media') {
      query = { authorId: new ObjectId(userId), images: { $exists: true, $ne: [] } };
    } else if (type === 'likes') {
      query = { likes: new ObjectId(req.user.userId) };
    }

    const postsData = await posts
      .aggregate([
        { $match: query },
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
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
      ])
      .toArray();

    const formattedPosts = postsData.map((post) => ({
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
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    const targetUser = await users.findOne({ _id: new ObjectId(userId) });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
    const isFollowing = currentUser.following && currentUser.following.some(id => id.toString() === userId);

    if (isFollowing) {
      // Unfollow
      await users.updateOne(
        { _id: new ObjectId(currentUserId) },
        { $pull: { following: new ObjectId(userId) } }
      );
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { followers: new ObjectId(currentUserId) } }
      );
      res.json({ message: 'User unfollowed', following: false });
    } else {
      // Follow
      await users.updateOne(
        { _id: new ObjectId(currentUserId) },
        { $addToSet: { following: new ObjectId(userId) } }
      );
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { followers: new ObjectId(currentUserId) } }
      );
      res.json({ message: 'User followed', following: true });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const userId = req.user.userId;

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await users.findOne({ 
        username, 
        _id: { $ne: new ObjectId(userId) } 
      });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Get all users (for search)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    let query = { _id: { $ne: new ObjectId(req.user.userId) } };
    
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        ...query,
        $or: [
          { username: searchRegex },
          { bio: searchRegex }
        ]
      };
    }

    const usersData = await users
      .find(query)
      .limit(20)
      .toArray();

    const formattedUsers = usersData.map((user) => ({
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
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Update user (Admin CRUD)
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address'
      });
    }

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    // Check if email is already taken by another user
    const existingUser = await users.findOne({ 
      email, 
      _id: { $ne: new ObjectId(userId) } 
    });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already taken by another user'
      });
    }

    const updateData = {
      username: name, // Using username field for name
      email: email,
      updatedAt: new Date(),
    };

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get updated user
    const updatedUser = await users.findOne({ _id: new ObjectId(userId) });

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  } finally {
    await client.close();
  }
});

// Delete user (Admin CRUD)
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await client.connect();
    const db = client.db('zynk');
    const users = db.collection('users');

    // Check if user exists
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Delete user
    const result = await users.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  } finally {
    await client.close();
  }
});

module.exports = router;