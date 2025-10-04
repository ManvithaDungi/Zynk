const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();
const client = new MongoClient(process.env.MONGO_URI);

// Get posts (feed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');
    const users = db.collection('users');

    const currentUser = await users.findOne({ _id: new ObjectId(req.user.userId) });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followingIds = currentUser.following || [];
    const authorIds = [...followingIds, new ObjectId(req.user.userId)];

    const postsData = await posts
      .aggregate([
        { $match: { authorId: { $in: authorIds } } },
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
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, images } = req.body;
    if (!content?.trim() && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Post content or images are required' });
    }

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');
    const users = db.collection('users');

    const newPost = {
      content: content?.trim() || '',
      images: images || [],
      authorId: new ObjectId(req.user.userId),
      likes: [],
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await posts.insertOne(newPost);
    await users.updateOne({ _id: new ObjectId(req.user.userId) }, { $inc: { postsCount: 1 } });

    res.json({ message: 'Post created successfully', postId: result.insertedId });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Get specific post
router.get('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');

    const post = await posts
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
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

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const formattedPost = {
      id: post[0]._id.toString(),
      content: post[0].content,
      images: post[0].images || [],
      author: {
        id: post[0].author._id.toString(),
        username: post[0].author.username,
        avatar: post[0].author.avatar,
        isVerified: post[0].author.isVerified || false,
      },
      likes: post[0].likes || [],
      comments: post[0].comments || 0,
      createdAt: post[0].createdAt,
      updatedAt: post[0].updatedAt,
    };

    res.json({ post: formattedPost });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Update post
router.put('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, images } = req.body;
    if (!content?.trim() && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Post content or images are required' });
    }

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');

    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    await posts.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { content: content?.trim() || '', images: images || [], updatedAt: new Date() } }
    );

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Delete post
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');
    const users = db.collection('users');

    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await posts.deleteOne({ _id: new ObjectId(postId) });
    await users.updateOne({ _id: new ObjectId(req.user.userId) }, { $inc: { postsCount: -1 } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');

    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = new ObjectId(req.user.userId);
    const isLiked = post.likes && post.likes.some(like => like.toString() === req.user.userId);

    if (isLiked) {
      // Unlike
      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { likes: userId } }
      );
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { likes: userId } }
      );
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Add comment to post
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    await client.connect();
    const db = client.db('zynk');
    const posts = db.collection('posts');

    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      _id: new ObjectId(),
      content: content.trim(),
      authorId: new ObjectId(req.user.userId),
      createdAt: new Date(),
    };

    await posts.updateOne(
      { _id: new ObjectId(postId) },
      { 
        $push: { comments: newComment },
        $inc: { commentsCount: 1 }
      }
    );

    res.json({ message: 'Comment added successfully', commentId: newComment._id });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

module.exports = router;
