const express = require("express")
const Memory = require("../models/Memory")
const Album = require("../models/Album")
const Event = require("../models/Event")
const { authenticate } = require('./auth');

const router = express.Router()

// Get all memories
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, albumId, eventId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (albumId) filter.album = albumId;
    if (eventId) filter.event = eventId;

    const memories = await Memory.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('album', 'name description')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Memory.countDocuments(filter);

    res.json({
      memories: memories.map(memory => ({
        id: memory._id,
        title: memory.title,
        description: memory.description,
        mediaUrl: memory.mediaUrl,
        mediaType: memory.mediaType,
        createdBy: memory.createdBy,
        album: memory.album,
        event: memory.event,
        likesCount: memory.likesCount,
        commentsCount: memory.commentsCount,
        isLikedByUser: memory.likes.some(like => like.user.toString() === req.userId),
        createdAt: memory.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get memories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get memories by album
router.get("/album/:albumId", authenticate, async (req, res) => {
  try {
    const { albumId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const memories = await Memory.find({ album: albumId })
      .populate('createdBy', 'name email avatar')
      .populate('album', 'name description')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Memory.countDocuments({ album: albumId });

    res.json({
      memories: memories.map(memory => ({
        id: memory._id,
        title: memory.title,
        description: memory.description,
        mediaUrl: memory.mediaUrl,
        mediaType: memory.mediaType,
        createdBy: memory.createdBy,
        album: memory.album,
        event: memory.event,
        likesCount: memory.likesCount,
        commentsCount: memory.commentsCount,
        isLikedByUser: memory.likes.some(like => like.user.toString() === req.userId),
        createdAt: memory.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get album memories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get memories by event
router.get("/event/:eventId", authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const memories = await Memory.find({ event: eventId })
      .populate('createdBy', 'name email avatar')
      .populate('album', 'name description')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Memory.countDocuments({ event: eventId });

    res.json({
      memories: memories.map(memory => ({
        id: memory._id,
        title: memory.title,
        description: memory.description,
        mediaUrl: memory.mediaUrl,
        mediaType: memory.mediaType,
        createdBy: memory.createdBy,
        album: memory.album,
        event: memory.event,
        likesCount: memory.likesCount,
        commentsCount: memory.commentsCount,
        isLikedByUser: memory.likes.some(like => like.user.toString() === req.userId),
        createdAt: memory.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get event memories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single memory by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('album', 'name description')
      .populate('event', 'title date location')
      .populate('comments.user', 'name email avatar');

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    res.json({
      id: memory._id,
      title: memory.title,
      description: memory.description,
      mediaUrl: memory.mediaUrl,
      mediaType: memory.mediaType,
      createdBy: memory.createdBy,
      album: memory.album,
      event: memory.event,
      likesCount: memory.likesCount,
      commentsCount: memory.commentsCount,
      comments: memory.comments,
      isLikedByUser: memory.likes.some(like => like.user.toString() === req.user.id),
      createdAt: memory.createdAt
    });
  } catch (error) {
    console.error("Get memory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Basic input sanitizer to prevent accidental script injection
const sanitizeInput = (value) => {
  if (typeof value !== "string") return value
  return value.replace(/<[^>]*>?/gm, "").trim()
}

// Create new memory
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType, albumId } = req.body

    if (!title || !mediaUrl || !mediaType || !albumId) {
      return res.status(400).json({
        message: "Title, media URL, media type, and album ID are required",
      })
    }

    // Check if album exists and user has access
    const album = await Album.findById(albumId).populate("event")
    if (!album) {
      return res.status(404).json({ message: "Album not found" })
    }

    const event = album.event
    const isHost = (event.organizer?.toString?.() || event.host?.toString?.()) === req.userId
    const isRegistered = (event.attendees || event.registeredUsers || []).some((reg) => {
      const regId = reg.user ? reg.user.toString() : reg.toString()
      return regId === req.userId
    })

    if (!isHost && !isRegistered) {
      return res.status(403).json({ message: "Access denied. You must be registered for this event." })
    }

    const memory = new Memory({
      title: sanitizeInput(title),
      description: sanitizeInput(description || ""),
      mediaUrl: sanitizeInput(mediaUrl),
      mediaType: mediaType,
      album: albumId,
      event: event._id,
      createdBy: req.userId,
    })

    await memory.save()

    // Add memory to album
    await Album.findByIdAndUpdate(albumId, {
      $push: { memories: memory._id },
    })

    const populatedMemory = await Memory.findById(memory._id).populate("createdBy", "name email")

    res.status(201).json({
      message: "Memory created successfully",
      memory: {
        id: populatedMemory._id,
        title: populatedMemory.title,
        description: populatedMemory.description,
        mediaUrl: populatedMemory.mediaUrl,
        mediaType: populatedMemory.mediaType,
        createdBy: populatedMemory.createdBy,
        likesCount: 0,
        commentsCount: 0,
        isLikedByUser: false,
        createdAt: populatedMemory.createdAt,
      },
    })
  } catch (error) {
    console.error("Create memory error:", error)
    res.status(500).json({
      message: "Server error during memory creation",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Like/unlike memory
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" })
    }

    const existingLikeIndex = memory.likes.findIndex((like) => like.user.toString() === req.userId)

    if (existingLikeIndex > -1) {
      // Unlike
      memory.likes.splice(existingLikeIndex, 1)
      memory.likesCount = memory.likes.length
      await memory.save()

      res.json({
        message: "Memory unliked",
        isLiked: false,
        likesCount: memory.likesCount,
      })
    } else {
      // Like
      memory.likes.push({
        user: req.userId,
        likedAt: new Date(),
      })
      memory.likesCount = memory.likes.length
      await memory.save()

      res.json({
        message: "Memory liked",
        isLiked: true,
        likesCount: memory.likesCount,
      })
    }
  } catch (error) {
    console.error("Like memory error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Add comment to memory
router.post("/:id/comment", authenticate, async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" })
    }

    const memory = await Memory.findById(req.params.id)
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" })
    }

    memory.comments.push({
      user: req.userId,
      text: sanitizeInput(text),
      createdAt: new Date(),
    })
    memory.commentsCount = memory.comments.length
    await memory.save()

    const populatedMemory = await Memory.findById(memory._id).populate("comments.user", "name")

    const newComment = populatedMemory.comments[populatedMemory.comments.length - 1]

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: newComment._id,
        text: newComment.text,
        user: newComment.user,
        createdAt: newComment.createdAt,
      },
      commentsCount: memory.commentsCount,
    })
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({
      message: "Server error during comment creation",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Delete memory
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" })
    }

    // Check if user is the creator
    if (memory.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied. You can only delete your own memories." })
    }

    // Remove memory from album
    await Album.findByIdAndUpdate(memory.album, {
      $pull: { memories: memory._id },
    })

    // Delete the memory
    await Memory.findByIdAndDelete(req.params.id)

    res.json({ message: "Memory deleted successfully" })
  } catch (error) {
    console.error("Delete memory error:", error)
    res.status(500).json({
      message: "Server error during memory deletion",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Update memory
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { title, description } = req.body

    const memory = await Memory.findById(req.params.id)
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" })
    }

    // Check if user is the creator
    if (memory.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied. You can only edit your own memories." })
    }

    const updatedMemory = await Memory.findByIdAndUpdate(
      req.params.id,
      {
        title: sanitizeInput(title) || memory.title,
        description: sanitizeInput(description) || memory.description,
      },
      { new: true },
    ).populate("createdBy", "name email")

    res.json({
      message: "Memory updated successfully",
      memory: {
        id: updatedMemory._id,
        title: updatedMemory.title,
        description: updatedMemory.description,
        mediaUrl: updatedMemory.mediaUrl,
        mediaType: updatedMemory.mediaType,
        createdBy: updatedMemory.createdBy,
        likesCount: updatedMemory.likesCount,
        commentsCount: updatedMemory.commentsCount,
        createdAt: updatedMemory.createdAt,
      },
    })
  } catch (error) {
    console.error("Update memory error:", error)
    res.status(500).json({
      message: "Server error during memory update",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

module.exports = router
