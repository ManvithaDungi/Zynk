
//backend/routes/eventRoutes.js
const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's registered events
router.get('/user/registered', auth, async (req, res) => {
  try {
    const events = await Event.find({
      registeredUsers: req.user.id,
      status: { $ne: 'cancelled' }
    })
    .populate('hostId', 'name')
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
      eventImage: event.eventImage,
      hostName: event.hostName,
      registrationCount: event.registrationCount,
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
      eventImage: event.eventImage,
      hostName: event.organizer?.name,
      registrationCount: (event.attendees || []).length,
      isRegistered: false,
      isFull: event.maxAttendees && (event.attendees || []).length >= event.maxAttendees
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
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventData = {
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      eventImage: event.eventImage,
      hostName: event.organizer?.name,
      hostId: event.organizer?._id,
      registrationCount: (event.attendees || []).length,
      maxAttendees: event.maxAttendees,
      status: event.status,
      isRegistered: false,
      isHost: false,
      isFull: event.maxAttendees && (event.attendees || []).length >= event.maxAttendees,
      registeredUsers: (event.attendees || []).map(user => ({
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

// Create new event
router.post('/create', auth, async (req, res) => {
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
      thumbnail: { url: eventImage || '' },
      maxAttendees: maxAttendees || null,
      organizer: req.user.id
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
router.post('/:id/register', auth, async (req, res) => {
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
    if (event.registeredUsers.includes(req.user.id)) {
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
    event.registeredUsers.push(req.user.id);
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
router.delete('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Unregister user
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
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

module.exports = router;
