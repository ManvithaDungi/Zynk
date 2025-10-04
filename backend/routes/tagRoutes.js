const express = require('express');
const Tag = require('../models/Tag');
const { authenticateToken } = require('../utils/jwtAuth');
const { sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get all active tags
router.get('/', async (req, res) => {
  try {
    const { limit = 50, search } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tags = await Tag.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(parseInt(limit));

    res.json({
      tags: tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        usageCount: tag.usageCount
      }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Tag.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(parseInt(limit));

    res.json({
      tags: tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        usageCount: tag.usageCount
      }))
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create or get tag
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    const sanitizedName = sanitizeString(name).toLowerCase();

    // Try to find existing tag
    let tag = await Tag.findOne({ name: sanitizedName });

    if (!tag) {
      // Create new tag
      tag = new Tag({ name: sanitizedName });
      await tag.save();
    } else if (!tag.isActive) {
      // Reactivate existing tag
      tag.isActive = true;
      await tag.save();
    }

    res.json({
      tag: {
        id: tag._id,
        name: tag.name,
        usageCount: tag.usageCount
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tag usage count
router.put('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = 1 } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    tag.usageCount += increment;
    await tag.save();

    res.json({
      message: 'Tag usage updated',
      tag: {
        id: tag._id,
        name: tag.name,
        usageCount: tag.usageCount
      }
    });
  } catch (error) {
    console.error('Update tag usage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
