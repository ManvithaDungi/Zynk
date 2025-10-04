const express = require('express');
const Album = require('../models/Album');
const Event = require('../models/Event');
const Post = require('../models/Post');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get user's albums
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const albums = await Album.find({ createdBy: req.user.userId })
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Album.countDocuments({ createdBy: req.user.userId });

    res.json({
      albums: albums.map(album => ({
        id: album._id,
        name: album.name,
        description: album.description,
        eventId: album.eventId,
        thumbnail: album.thumbnail,
        isPublic: album.isPublic,
        createdAt: album.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get albums by event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const albums = await Album.find({ eventId })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      albums: albums.map(album => ({
        id: album._id,
        name: album.name,
        description: album.description,
        createdBy: album.createdBy,
        thumbnail: album.thumbnail,
        isPublic: album.isPublic,
        createdAt: album.createdAt
      }))
    });
  } catch (error) {
    console.error('Get event albums error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create album
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, eventId } = req.body;

    // Input validation
    if (!name) {
      return res.status(400).json({ message: 'Album name is required' });
    }

    const albumData = {
      name: sanitizeString(name),
      description: sanitizeString(description || ''),
      createdBy: req.user.userId
    };

    // Add eventId if provided and valid
    if (eventId && isValidObjectId(eventId)) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      albumData.eventId = eventId;
    }

    const album = new Album(albumData);
    const savedAlbum = await album.save();

    res.status(201).json({
      message: 'Album created successfully',
      album: {
        id: savedAlbum._id,
        name: savedAlbum.name,
        description: savedAlbum.description,
        eventId: savedAlbum.eventId,
        thumbnail: savedAlbum.thumbnail,
        isPublic: savedAlbum.isPublic,
        createdAt: savedAlbum.createdAt
      }
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get album by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    const album = await Album.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('eventId', 'title date location');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json({
      album: {
        id: album._id,
        name: album.name,
        description: album.description,
        eventId: album.eventId,
        createdBy: album.createdBy,
        thumbnail: album.thumbnail,
        isPublic: album.isPublic,
        createdAt: album.createdAt
      }
    });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get album posts
router.get('/:id/posts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const posts = await Post.find({ album: id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ album: id });

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        caption: post.caption,
        media: post.media,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        user: post.user,
        createdAt: post.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get album posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update album
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Check if user is the creator
    if (album.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can update this album' });
    }

    // Update fields
    if (name) album.name = sanitizeString(name);
    if (description !== undefined) album.description = sanitizeString(description);
    if (isPublic !== undefined) album.isPublic = isPublic;

    await album.save();

    res.json({ message: 'Album updated successfully' });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete album
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid album ID' });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Check if user is the creator
    if (album.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this album' });
    }

    // Delete album and related posts
    await Promise.all([
      Album.findByIdAndDelete(id),
      Post.deleteMany({ album: id })
    ]);

    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;