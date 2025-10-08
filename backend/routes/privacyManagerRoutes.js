const express = require('express');
const PrivacyManager = require('../models/PrivacyManager');
const Post = require('../models/Post');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Get all privacy settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const privacySettings = await PrivacyManager.find().populate('memoryId');
    res.json(privacySettings);
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all groups (placeholder - you can implement actual groups later)
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    // For now, return default groups
    // In a real implementation, you'd have a Group model
    const defaultGroups = [
      { _id: "1", name: "Event Organizers", description: "Users who can organize events", members: [] },
      { _id: "2", name: "Content Creators", description: "Users who create posts and content", members: [] },
      { _id: "3", name: "Admins", description: "Administrative users", members: [] }
    ];
    res.json(defaultGroups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get memories (posts and events) with privacy settings
router.get('/memories', authenticateToken, async (req, res) => {
  try {
    // Fetch posts
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate('album', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch events
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get privacy settings
    const privacyDocs = await PrivacyManager.find().lean();
    const privacyMap = new Map(privacyDocs.map(doc => [doc.memoryId?.toString(), doc]));

    // Combine and format data
    const combinedMemories = [
      ...posts.map(post => ({
        _id: post._id,
        title: post.caption || "Untitled Post",
        description: post.caption || "",
        author: post.user?.name || "Unknown",
        category: "Post",
        tags: [],
        imageUrl: post.media?.[0]?.url || "/images/posts/grand-opening-ceremony.png",
        createdAt: post.createdAt,
        type: "post",
        visibility: post.visibility || "public",
        settings: post.settings || { allowDownload: true, allowSharing: true, allowComments: true }
      })),
      ...events.map(event => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        author: event.organizer?.name || "Unknown",
        category: event.category || "Event",
        tags: event.tags || [],
        imageUrl: event.thumbnail?.url || event.eventImage || "/images/events/event1.jpg",
        createdAt: event.createdAt,
        type: "event",
        visibility: event.visibility || "public",
        settings: event.settings || { allowDownload: true, allowSharing: true, allowComments: true }
      }))
    ];

    res.json(combinedMemories);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get privacy settings by memory ID
router.get('/memory/:memoryId', authenticateToken, async (req, res) => {
  try {
    const privacySettings = await PrivacyManager.findOne({
      memoryId: req.params.memoryId,
    });
    if (!privacySettings) {
      return res.status(404).json({ error: "Privacy settings not found" });
    }
    res.json(privacySettings);
  } catch (error) {
    console.error('Get privacy by memory ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update privacy settings
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { memoryId } = req.body;

    let privacySettings = await PrivacyManager.findOne({
      memoryId,
    });

    if (privacySettings) {
      // Update existing
      privacySettings = await PrivacyManager.findOneAndUpdate(
        { memoryId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      // Create new
      privacySettings = new PrivacyManager(req.body);
      await privacySettings.save();
    }

    res.json(privacySettings);
  } catch (error) {
    console.error('Create/update privacy error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Bulk update privacy settings
router.put('/bulk', authenticateToken, async (req, res) => {
  try {
    const { memoryIds, privacySettings } = req.body;

    const updatePromises = memoryIds.map(async (memoryId) => {
      // Update the actual Post or Event document
      const post = await Post.findById(memoryId);
      if (post) {
        post.visibility = privacySettings.visibility;
        post.settings = privacySettings.settings;
        await post.save();
      }

      const event = await Event.findById(memoryId);
      if (event) {
        event.visibility = privacySettings.visibility;
        event.settings = privacySettings.settings;
        await event.save();
      }

      // Also update PrivacyManager collection
      return PrivacyManager.findOneAndUpdate(
        { memoryId },
        { ...privacySettings, memoryId },
        { new: true, upsert: true, runValidators: true }
      );
    });

    const results = await Promise.all(updatePromises);
    res.json(results);
  } catch (error) {
    console.error('Bulk update privacy error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete privacy settings
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const privacySettings = await PrivacyManager.findByIdAndDelete(req.params.id);
    if (!privacySettings) {
      return res.status(404).json({ error: "Privacy settings not found" });
    }
    res.json({
      message: "Privacy settings deleted successfully",
    });
  } catch (error) {
    console.error('Delete privacy settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
