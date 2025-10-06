const Event = require("../models/Event");

// 🟢 Create Event
exports.createEvent = async (req, res) => {
  try {
    console.log("📌 Create Event API hit");

    const { title, description, date, media, tag } = req.body;

    // Validate input
    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required" });
    }

    // Create new event with fallback default tag
    const newEvent = new Event({
      title,
      description,
      date: new Date(date),
      media,
      tag: tag || "Public", // ✅ Default tag if none provided
      user: req.user ? req.user.id : null,
    });

    const savedEvent = await newEvent.save();
    console.log("✅ Event saved:", savedEvent);
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({
      error: "Server error creating event",
      details: err.message,
    });
  }
};

// 🟣 Get all events
exports.getEvents = async (req, res) => {
  try {
    console.log("📌 Get Events API hit");
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ error: "Server error fetching events" });
  }
};

// 🔵 Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    console.log("📌 Get Event By ID API hit:", req.params.id);
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("❌ Error fetching event by id:", err);
    res.status(500).json({ error: "Server error fetching event" });
  }
};

// 🟠 Update Event
exports.updateEvent = async (req, res) => {
  try {
    console.log("📌 Update Event API hit:", req.params.id);

    const { title, description, date, media, tag } = req.body;

    // Build a dynamic update object (only update provided fields)
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (media) updateData.media = media;
    if (tag) updateData.tag = tag; // ✅ Tag now editable and updatable

    // Update event in DB
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    console.log("✅ Event updated successfully:", updatedEvent);
    res.json(updatedEvent);
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ error: "Server error updating event" });
  }
};

// 🔴 Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    console.log("📌 Delete Event API hit:", req.params.id);

    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    console.log("✅ Event deleted:", deleted.title);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ error: "Server error deleting event" });
  }
};
