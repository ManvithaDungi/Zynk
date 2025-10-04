const express = require('express');
const Category = require('../models/Category');
const { authenticateToken, requireAdmin } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      categories: categories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryData = {
      name: sanitizeString(name),
      description: sanitizeString(description || ''),
      icon: icon || '📅',
      color: color || '#000000'
    };

    const category = new Category(categoryData);
    const savedCategory = await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: savedCategory._id,
        name: savedCategory.name,
        description: savedCategory.description,
        icon: savedCategory.icon,
        color: savedCategory.color
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    if (name) category.name = sanitizeString(name);
    if (description !== undefined) category.description = sanitizeString(description);
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        isActive: category.isActive
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
