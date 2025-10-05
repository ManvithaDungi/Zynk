const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/feedback';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'feedback-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Submit feedback
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const {
      name,
      email,
      category,
      subject,
      message,
      priority,
      rating,
      subscribe,
      contactMethod,
      phone,
      bestTimeToContact,
      hearAboutUs,
      recommendToFriend,
      improvements
    } = req.body;

    // Validation
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({
        message: 'Name, email, category, subject, and message are required'
      });
    }

    // Parse improvements if it's a JSON string
    let parsedImprovements = [];
    if (improvements) {
      try {
        parsedImprovements = JSON.parse(improvements);
      } catch (e) {
        parsedImprovements = [improvements];
      }
    }

    // Create feedback object
    const feedbackData = {
      name,
      email,
      category,
      subject,
      message,
      priority: priority || 'medium',
      rating: parseInt(rating) || 5,
      subscribe: subscribe === 'true' || subscribe === true,
      contactMethod: contactMethod || 'email',
      phone,
      bestTimeToContact,
      hearAboutUs,
      recommendToFriend,
      improvements: parsedImprovements,
      attachment: req.file ? req.file.path : null,
      attachmentOriginalName: req.file ? req.file.originalname : null,
      status: 'new',
      createdAt: new Date(),
      ipAddress: req.ip
    };

    // In a real app, you would save this to the database
    // For now, we'll log it and send a confirmation email
    console.log('Feedback received:', feedbackData);

    // Here you would:
    // 1. Save to MongoDB
    // 2. Send confirmation email to user
    // 3. Send notification to admin
    // 4. Integrate with support ticketing system

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: Date.now().toString() // Temporary ID
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Get all feedback (admin only)
router.get('/', async (req, res) => {
  try {
    // In a real app, fetch from database with pagination
    // For now, return empty array
    res.json({
      feedback: [],
      total: 0,
      page: 1,
      limit: 20
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Get feedback by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, fetch from database
    res.json({
      feedback: {
        id,
        name: 'Sample User',
        email: 'user@example.com',
        category: 'bug-report',
        subject: 'Sample Feedback',
        message: 'This is a sample feedback message.',
        status: 'new',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Update feedback status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    // In a real app, update in database
    res.json({
      message: 'Feedback status updated successfully',
      feedbackId: id,
      status
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      message: 'Failed to update feedback',
      error: error.message
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, delete from database and remove attachment file
    res.json({
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
});

module.exports = router;

