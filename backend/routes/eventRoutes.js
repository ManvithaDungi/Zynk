const express = require('express');
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');
const Category = require('../models/Category');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString, isValidTime } = require('../utils/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'active' } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status };
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .populate('organizer', 'name email avatar')
      .populate('registeredUsers', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        registrationCount: event.registrationCount,
        thumbnail: event.thumbnail,
        organizer: event.organizer,
        status: event.status,
        isRegistered: event.registeredUsers.some(user => user._id.toString() === req.user.userId),
        createdAt: event.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming events
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: 'active'
    })
      .populate('organizer', 'name email avatar')
      .sort({ date: 1 })
      .limit(20);

    res.json({
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        registrationCount: event.registrationCount,
        thumbnail: event.thumbnail,
        organizer: event.organizer,
        isRegistered: event.registeredUsers.some(user => user._id.toString() === req.user.userId)
      }))
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's registered events
router.get('/user/registered', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({
      registeredUsers: req.user.userId,
      status: 'active'
    })
      .populate('organizer', 'name email avatar')
      .sort({ date: 1 });

    res.json({
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        registrationCount: event.registrationCount,
        thumbnail: event.thumbnail,
        organizer: event.organizer
      }))
    });
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create event
router.post('/create', authenticateToken, upload.single('eventImage'), async (req, res) => {
  try {
    const { title, description, date, time, location, category, maxAttendees } = req.body;

    // Input validation
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({
        message: 'All required fields must be provided'
      });
    }

    // Validate time format
    if (!isValidTime(time)) {
      return res.status(400).json({
        message: 'Invalid time format. Use HH:MM'
      });
    }

    // Validate date
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        message: 'Event date must be in the future'
      });
    }

    // Handle category - find or create category
    let categoryId;
    if (category) {
      // Try to find existing category by name
      let existingCategory = await Category.findOne({ name: category });
      if (!existingCategory) {
        // Create new category if it doesn't exist
        existingCategory = await Category.create({ 
          name: category, 
          description: `${category} events` 
        });
      }
      categoryId = existingCategory._id;
    } else {
      // Default category
      let defaultCategory = await Category.findOne({ name: 'Other' });
      if (!defaultCategory) {
        defaultCategory = await Category.create({ 
          name: 'Other', 
          description: 'General events' 
        });
      }
      categoryId = defaultCategory._id;
    }

    const eventData = {
      title: sanitizeString(title),
      description: sanitizeString(description),
      date: eventDate,
      time: sanitizeString(time),
      location: sanitizeString(location),
      category: categoryId,
      maxAttendees: parseInt(maxAttendees) || 100,
      organizer: req.user.userId
    };

    // Add thumbnail if uploaded or provided in request body
    if (req.file) {
      eventData.thumbnail = {
        url: `/uploads/events/${req.file.filename}`,
        publicId: req.file.filename
      };
    } else if (req.body.thumbnail) {
      // Handle thumbnail URL from request body (for seeding)
      eventData.thumbnail = req.body.thumbnail;
    }

    const event = new Event(eventData);
    const savedEvent = await event.save();

    await savedEvent.populate('organizer', 'name email avatar');

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: savedEvent._id,
        title: savedEvent.title,
        description: savedEvent.description,
        date: savedEvent.date,
        time: savedEvent.time,
        location: savedEvent.location,
        category: savedEvent.category,
        maxAttendees: savedEvent.maxAttendees,
        thumbnail: savedEvent.thumbnail,
        organizer: savedEvent.organizer,
        status: savedEvent.status
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id)
      .populate('organizer', 'name email avatar')
      .populate('registeredUsers', 'name email avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer exists
    if (!event.organizer) {
      return res.status(500).json({ message: 'Event organizer not found' });
    }

    const isRegistered = event.registeredUsers.some(user => user._id.toString() === req.user.userId);
    const isHost = event.organizer._id.toString() === req.user.userId;

    res.json({
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        registrationCount: event.registrationCount,
        thumbnail: event.thumbnail,
        organizer: event.organizer,
        registeredUsers: event.registeredUsers,
        status: event.status,
        isRegistered,
        isHost,
        createdAt: event.createdAt
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ message: 'Event is not active' });
    }

    if (event.registeredUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registeredUsers.push(req.user.userId);
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unregister from event
router.post('/:id/unregister', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.userId
    );
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, category, maxAttendees, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the organizer can update this event' });
    }

    // Update fields
    if (title) event.title = sanitizeString(title);
    if (description) event.description = sanitizeString(description);
    if (date) event.date = new Date(date);
    if (time) {
      if (!isValidTime(time)) {
        return res.status(400).json({ message: 'Invalid time format' });
      }
      event.time = sanitizeString(time);
    }
    if (location) event.location = sanitizeString(location);
    if (category) event.category = category;
    if (maxAttendees) event.maxAttendees = parseInt(maxAttendees);
    if (status) event.status = status;

    await event.save();

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the organizer can delete this event' });
    }

    await Event.findByIdAndDelete(id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;