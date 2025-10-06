const express = require('express');
const Post = require('../models/Post');
const Album = require('../models/Album');
const User = require('../models/User');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get all posts (feed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get posts from followed users and public albums
    const posts = await Post.find({
      $or: [
        { user: { $in: currentUser.following } },
        { album: { $in: await Album.find({ isPublic: true }).distinct('_id') } }
      ]
    })
      .populate('user', 'name email avatar')
      .populate('album', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      $or: [
        { user: { $in: currentUser.following } },
        { album: { $in: await Album.find({ isPublic: true }).distinct('_id') } }
      ]
    });

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        isLiked: post.likes.some(like => like.user && like.user.toString() === req.user.userId),
        createdAt: post.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all posts by current user (for memories page)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all posts created by the current user
    const posts = await Post.find({ user: req.user.userId })
      .populate('user', 'name email avatar')
      .populate('album', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ user: req.user.userId });

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        visibility: post.visibility,
        isLiked: post.likes.some(like => like.user && like.user.toString() === req.user.userId),
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
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { caption, album, albumId, media } = req.body;

    // Input validation
    if (!caption || !media || !Array.isArray(media) || media.length === 0) {
      return res.status(400).json({
        message: 'Caption and at least one media item are required'
      });
    }

    let albumToUse = album || albumId;

    // If no album provided, create or find default "Standalone Memories" album
    if (!albumToUse) {
      let defaultAlbum = await Album.findOne({ 
        name: 'Standalone Memories', 
        createdBy: req.user.userId 
      });
      
      if (!defaultAlbum) {
        // Create default album for standalone memories
        defaultAlbum = new Album({
          name: 'Standalone Memories',
          description: 'Default album for standalone memories',
          createdBy: req.user.userId,
          isPublic: false
        });
        await defaultAlbum.save();
      }
      
      albumToUse = defaultAlbum._id;
    }

    if (!isValidObjectId(albumToUse)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    // Check if album exists and user has access
    const albumDoc = await Album.findById(albumToUse);
    if (!albumDoc) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (albumDoc.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only post to your own albums' });
    }

    const postData = {
      caption: sanitizeString(caption),
      album: albumToUse,
      user: req.user.userId,
      media: media.map(item => ({
        url: item.url,
        type: item.type,
        filename: item.filename
      }))
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    // Update user's posts count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { postsCount: 1 }
    });

    await savedPost.populate('user', 'name email avatar');
    await savedPost.populate('album', 'name');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: savedPost._id,
        caption: savedPost.caption,
        media: savedPost.media,
        likesCount: savedPost.likesCount,
        commentsCount: savedPost.commentsCount,
        user: savedPost.user,
        album: savedPost.album,
        createdAt: savedPost.createdAt
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get post by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id)
      .populate('user', 'name email avatar')
      .populate('album', 'name')
      .populate('comments.user', 'name email avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      post: {
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        album: post.album,
        comments: post.comments,
        isLiked: post.likes.some(like => like.user && like.user.toString() === req.user.userId),
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const alreadyLiked = post.likes.some(like => like.user && like.user.toString() === req.user.userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push({ user: req.user.userId });
    await post.save();

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unlike post
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes = post.likes.filter(like => like.user && like.user.toString() !== req.user.userId);
    await post.save();

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user.userId,
      text: sanitizeString(text)
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'name email avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        text: newComment.text,
        user: newComment.user,
        createdAt: newComment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the author can update this post' });
    }

    if (caption) {
      post.caption = sanitizeString(caption);
    }

    await post.save();

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the author can delete this post' });
    }

    await Post.findByIdAndDelete(id);

    // Update user's posts count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { postsCount: -1 }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;