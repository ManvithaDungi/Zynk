const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads (logo, favicon)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/site';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fieldName = file.fieldname; // siteLogo or siteFavicon
    const uniqueSuffix = Date.now();
    cb(null, fieldName + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only images
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Default settings
const defaultSettings = {
  // Site Configuration
  siteName: 'Zynk',
  siteTagline: 'Connect Through Events',
  siteDescription: '',
  siteLogo: null,
  siteFavicon: null,
  
  // Theme Settings
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#666666',
  themeMode: 'light',
  
  // Feature Toggles
  enableRegistration: true,
  enableEvents: true,
  enableAlbums: true,
  enableMemories: true,
  enableComments: true,
  enableReviews: true,
  enableChat: true,
  enableNotifications: true,
  enableAnalytics: true,
  
  // Privacy & Security
  defaultPostVisibility: 'public',
  requireEmailVerification: false,
  enableTwoFactor: false,
  sessionTimeout: 30,
  passwordMinLength: 6,
  
  // Content Moderation
  autoModeration: false,
  profanityFilter: true,
  spamFilter: true,
  moderationLevel: 'medium',
  
  // Email Settings
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  emailFrom: '',
  emailFromName: '',
  
  // Upload Settings
  maxFileSize: 5,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  maxImagesPerPost: 10,
  
  // Maintenance
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
  
  // Social Media Links
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  
  // Analytics
  googleAnalyticsId: '',
  facebookPixelId: '',
  
  // Legal
  termsOfServiceUrl: '',
  privacyPolicyUrl: '',
  contactEmail: '',
  supportEmail: ''
};

// In-memory storage for demo (in production, use MongoDB)
let currentSettings = { ...defaultSettings };

// Get current settings
router.get('/', async (req, res) => {
  try {
    // In a real app, fetch from database
    res.json({
      settings: currentSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Update settings
router.put('/', upload.fields([
  { name: 'siteLogo', maxCount: 1 },
  { name: 'siteFavicon', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.siteLogo) {
        updates.siteLogo = req.files.siteLogo[0].path;
      }
      if (req.files.siteFavicon) {
        updates.siteFavicon = req.files.siteFavicon[0].path;
      }
    }

    // Parse JSON fields
    if (updates.allowedFileTypes) {
      try {
        updates.allowedFileTypes = JSON.parse(updates.allowedFileTypes);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    // Convert boolean strings to actual booleans
    const booleanFields = [
      'enableRegistration', 'enableEvents', 'enableAlbums', 'enableMemories',
      'enableComments', 'enableReviews', 'enableChat', 'enableNotifications',
      'enableAnalytics', 'requireEmailVerification', 'enableTwoFactor',
      'autoModeration', 'profanityFilter', 'spamFilter', 'maintenanceMode'
    ];

    booleanFields.forEach(field => {
      if (updates[field] !== undefined) {
        updates[field] = updates[field] === 'true' || updates[field] === true;
      }
    });

    // Convert number strings to actual numbers
    const numberFields = ['sessionTimeout', 'passwordMinLength', 'maxFileSize', 'maxImagesPerPost', 'smtpPort'];
    numberFields.forEach(field => {
      if (updates[field] !== undefined) {
        updates[field] = parseInt(updates[field]);
      }
    });

    // Validation
    if (updates.sessionTimeout && (updates.sessionTimeout < 5 || updates.sessionTimeout > 1440)) {
      return res.status(400).json({
        message: 'Session timeout must be between 5 and 1440 minutes'
      });
    }

    if (updates.passwordMinLength && (updates.passwordMinLength < 6 || updates.passwordMinLength > 32)) {
      return res.status(400).json({
        message: 'Password min length must be between 6 and 32'
      });
    }

    if (updates.maxFileSize && (updates.maxFileSize < 1 || updates.maxFileSize > 50)) {
      return res.status(400).json({
        message: 'Max file size must be between 1 and 50 MB'
      });
    }

    // Update settings
    currentSettings = {
      ...currentSettings,
      ...updates
    };

    // In a real app, save to database
    console.log('Settings updated:', currentSettings);

    res.json({
      message: 'Settings updated successfully',
      settings: currentSettings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// Reset settings to default
router.post('/reset', async (req, res) => {
  try {
    currentSettings = { ...defaultSettings };
    
    res.json({
      message: 'Settings reset to default successfully',
      settings: currentSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      message: 'Failed to reset settings',
      error: error.message
    });
  }
});

// Get specific setting category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Define category mappings
    const categories = {
      site: ['siteName', 'siteTagline', 'siteDescription', 'siteLogo', 'siteFavicon'],
      theme: ['primaryColor', 'secondaryColor', 'accentColor', 'themeMode'],
      features: ['enableRegistration', 'enableEvents', 'enableAlbums', 'enableMemories', 'enableComments', 'enableReviews', 'enableChat', 'enableNotifications', 'enableAnalytics'],
      security: ['defaultPostVisibility', 'requireEmailVerification', 'enableTwoFactor', 'sessionTimeout', 'passwordMinLength'],
      moderation: ['autoModeration', 'profanityFilter', 'spamFilter', 'moderationLevel'],
      email: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'emailFrom', 'emailFromName'],
      uploads: ['maxFileSize', 'allowedFileTypes', 'maxImagesPerPost'],
      maintenance: ['maintenanceMode', 'maintenanceMessage'],
      social: ['facebookUrl', 'twitterUrl', 'instagramUrl', 'linkedinUrl'],
      analytics: ['googleAnalyticsId', 'facebookPixelId'],
      legal: ['termsOfServiceUrl', 'privacyPolicyUrl', 'contactEmail', 'supportEmail']
    };

    const categoryFields = categories[category];
    if (!categoryFields) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    const categorySettings = {};
    categoryFields.forEach(field => {
      categorySettings[field] = currentSettings[field];
    });

    res.json({
      category,
      settings: categorySettings
    });

  } catch (error) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({
      message: 'Failed to fetch category settings',
      error: error.message
    });
  }
});

module.exports = router;

