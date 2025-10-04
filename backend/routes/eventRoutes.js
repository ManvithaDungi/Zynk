
//backend/routes/eventRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const { authenticateToken } = require('../utils/jwtAuth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get user's registered events
router.get('/user/registered', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({
      registeredUsers: req.user.userId,
      status: { $ne: 'cancelled' }
    })
    .populate('organizer', 'name')
    .sort({ date: 1 });

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      thumbnail: {
        url: event.thumbnail?.url || event.eventImage || null
      },
      hostName: event.organizer?.name,
      registrationCount: (event.registeredUsers || []).length,
      status: event.status
    }));

    res.json({
      success: true,
      events: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events'
    });
  }
});

// Get all upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const currentDate = new Date();
    
    // Build query
    const query = {
      date: { $gte: currentDate },
      status: 'active'
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      thumbnail: {
        url: event.thumbnail?.url || event.eventImage || null
      },
      hostName: event.organizer?.name,
      registrationCount: (event.registeredUsers || []).length,
      isRegistered: false,
      isFull: event.maxAttendees && (event.registeredUsers || []).length >= event.maxAttendees
    }));

    res.json({
      success: true,
      events: formattedEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Get single event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('registeredUsers', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authenticated and registered
    let isRegistered = false;
    let isHost = false;
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;
        
        isRegistered = event.registeredUsers.some(user => user._id.toString() === userId);
        isHost = event.organizer._id.toString() === userId;
      } catch (authError) {
        // Token is invalid, but we still return the event data
        console.log('Invalid token for event fetch:', authError.message);
      }
    }

    const eventData = {
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      thumbnail: {
        url: event.thumbnail?.url || event.eventImage || null
      },
      hostName: event.organizer?.name,
      hostId: event.organizer?._id,
      registrationCount: (event.registeredUsers || []).length,
      maxAttendees: event.maxAttendees,
      status: event.status,
      isRegistered: isRegistered,
      isHost: isHost,
      isFull: event.maxAttendees && (event.registeredUsers || []).length >= event.maxAttendees,
      registeredUsers: (event.registeredUsers || []).map(user => ({
        id: user._id,
        name: user.name,
        email: user.email
      }))
    };

    res.json({
      success: true,
      event: eventData
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
});

// Create new event (for CreateEvent page)
router.post('/create', authenticateToken, upload.single('eventImage'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      maxAttendees
    } = req.body;

    // Handle uploaded image
    let eventImageUrl = '';
    if (req.file) {
      eventImageUrl = `/uploads/events/${req.file.filename}`;
    }

    // Validation
    if (!title || !description || !category || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const event = new Event({
      title,
      description,
      category,
      date: eventDate,
      time,
      location,
      thumbnail: { url: eventImageUrl },
      maxAttendees: maxAttendees || null,
      organizer: req.user.userId
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        maxAttendees: event.maxAttendees,
        hostName: req.user.username
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Create new event (admin CRUD)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      eventImage,
      maxAttendees
    } = req.body;

    // Validation
    if (!title || !description || !category || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const event = new Event({
      title,
      description,
      category,
      date: eventDate,
      time,
      location,
      thumbnail: { url: eventImageUrl },
      maxAttendees: maxAttendees || null,
      organizer: req.user.userId
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        maxAttendees: event.maxAttendees,
        hostName: req.user.name
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is active
    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this event'
      });
    }

    // Check if event is in the future
    if (event.date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }

    // Check if already registered
    if (event.registeredUsers.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.maxAttendees && event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Register user
    event.registeredUsers.push(req.user.userId);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
});

// Unregister from event
router.delete('/:id/unregister', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registered
    if (!event.registeredUsers.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Unregister user
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.userId
    );
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister from event'
    });
  }
});

// Update event (Admin CRUD)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      eventImage,
      maxAttendees
    } = req.body;

    // Validation
    if (!title || !description || !category || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Update event
    const eventDate = new Date(date);
    event.title = title;
    event.description = description;
    event.category = category;
    event.date = eventDate;
    event.time = time;
    event.location = location;
    event.maxAttendees = maxAttendees || null;
    if (eventImage) {
      event.thumbnail = { url: eventImage };
    }

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        maxAttendees: event.maxAttendees,
        hostName: req.user.name
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// Delete event (Admin CRUD)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

module.exports = router;
