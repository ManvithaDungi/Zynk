const express = require("express")
const Album = require("../models/Album")
const Memory = require("../models/Memory")
const Event = require("../models/Event")
const User = require("../models/User")
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router()

// Basic input sanitizer to prevent accidental script injection
const sanitizeInput = (value) => {
  if (typeof value !== "string") return value
  return value.replace(/<[^>]*>?/gm, "").trim()
}

// Get user's albums (for Albums page)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const albums = await Album.find({ createdBy: req.user.userId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json({
      albums: albums.map((album) => ({
        id: album._id,
        name: album.title, // Frontend expects 'name' field
        description: album.description,
        coverImage: album.coverImage,
        createdBy: album.createdBy,
        postCount: album.memories ? album.memories.length : 0,
        createdAt: album.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get user albums error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Create album (for Albums page - without eventId)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        message: "Album name is required",
      })
    }

    const album = new Album({
      title: sanitizeInput(name), // Store as 'title' in DB
      description: sanitizeInput(description || ""),
      createdBy: req.user.userId,
      event: null, // Albums page doesn't require event
    })

    await album.save()

    const populatedAlbum = await Album.findById(album._id).populate("createdBy", "name email")

    res.status(201).json({
      message: "Album created successfully",
      album: {
        id: populatedAlbum._id,
        name: populatedAlbum.title, // Return as 'name' for frontend
        description: populatedAlbum.description,
        coverImage: populatedAlbum.coverImage,
        createdBy: populatedAlbum.createdBy,
        postCount: 0,
        createdAt: populatedAlbum.createdAt,
      },
    })
  } catch (error) {
    console.error("Create album error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Get posts for an album (for Albums page)
router.get("/:id/posts", authenticateToken, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("memories")

    if (!album) {
      return res.status(404).json({ message: "Album not found" })
    }

    // Check if user owns the album
    if (album.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Convert memories to posts format expected by frontend
    const posts = album.memories.map((memory) => ({
      id: memory._id,
      caption: memory.description || "",
      media: memory.mediaUrl ? [{
        url: memory.mediaUrl,
        type: memory.mediaType || "image"
      }] : [],
      createdAt: memory.createdAt,
    }))

    res.json({ posts })
  } catch (error) {
    console.error("Get album posts error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Get albums for an event
router.get("/event/:eventId", authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params

    // Check if user has access to this event (registered or host)
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    const isHost = (event.organizer?.toString?.() || event.host?.toString?.()) === req.user.userId
    const isRegistered = (event.attendees || event.registeredUsers || []).some((reg) => {
      const regId = reg.user ? reg.user.toString() : reg.toString()
      return regId === req.user.userId
    })

    if (!isHost && !isRegistered) {
      return res.status(403).json({ message: "Access denied. You must be registered for this event." })
    }

    const albums = await Album.find({ event: eventId })
      .populate("createdBy", "name email")
      .populate({
        path: "memories",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })

    res.json({
      albums: albums.map((album) => ({
        id: album._id,
        title: album.title,
        description: album.description,
        coverImage: album.coverImage,
        createdBy: album.createdBy,
        memoriesCount: album.memories.length,
        memories: album.memories.map((memory) => ({
          id: memory._id,
          title: memory.title,
          description: memory.description,
          mediaUrl: memory.mediaUrl,
          mediaType: memory.mediaType,
          createdBy: memory.createdBy,
          likesCount: memory.likesCount,
          commentsCount: memory.commentsCount,
          createdAt: memory.createdAt,
        })),
        createdAt: album.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get event albums error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Create new album
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, eventId, coverImage } = req.body

    if (!title || !eventId) {
      return res.status(400).json({
        message: "Title and event ID are required",
      })
    }

    // Check if user has access to create albums for this event
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    const isHost = (event.organizer?.toString?.() || event.host?.toString?.()) === req.user.userId
    const isRegistered = (event.attendees || event.registeredUsers || []).some((reg) => {
      const regId = reg.user ? reg.user.toString() : reg.toString()
      return regId === req.user.userId
    })

    if (!isHost && !isRegistered) {
      return res.status(403).json({ message: "Access denied. You must be registered for this event." })
    }

    const album = new Album({
      title: sanitizeInput(title),
      description: sanitizeInput(description || ""),
      event: eventId,
      createdBy: req.user.userId,
      coverImage: sanitizeInput(coverImage || ""),
    })

    await album.save()

    // Add album to event
    await Event.findByIdAndUpdate(eventId, {
      $push: { albums: album._id },
    })

    const populatedAlbum = await Album.findById(album._id).populate("createdBy", "name email")

    res.status(201).json({
      message: "Album created successfully",
      album: {
        id: populatedAlbum._id,
        title: populatedAlbum.title,
        description: populatedAlbum.description,
        coverImage: populatedAlbum.coverImage,
        createdBy: populatedAlbum.createdBy,
        memoriesCount: 0,
        memories: [],
        createdAt: populatedAlbum.createdAt,
      },
    })
  } catch (error) {
    console.error("Create album error:", error)
    res.status(500).json({
      message: "Server error during album creation",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Get album by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("event", "title host registeredUsers")
      .populate({
        path: "memories",
        populate: [
          {
            path: "createdBy",
            select: "name email",
          },
          {
            path: "likes.user",
            select: "name",
          },
          {
            path: "comments.user",
            select: "name",
          },
        ],
      })

    if (!album) {
      return res.status(404).json({ message: "Album not found" })
    }

    // Check access
    const isHost = (album.event.organizer?.toString?.() || album.event.host?.toString?.()) === req.user.userId
    const isRegistered = (album.event.attendees || album.event.registeredUsers || []).some((reg) => {
      const regId = reg.user ? reg.user.toString() : reg.toString()
      return regId === req.user.userId
    })

    if (!isHost && !isRegistered) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      album: {
        id: album._id,
        title: album.title,
        description: album.description,
        coverImage: album.coverImage,
        event: album.event,
        createdBy: album.createdBy,
        memories: album.memories.map((memory) => ({
          id: memory._id,
          title: memory.title,
          description: memory.description,
          mediaUrl: memory.mediaUrl,
          mediaType: memory.mediaType,
          createdBy: memory.createdBy,
          likes: memory.likes,
          comments: memory.comments,
          likesCount: memory.likesCount,
          commentsCount: memory.commentsCount,
          isLikedByUser: memory.likes.some((like) => like.user._id.toString() === req.user.userId),
          createdAt: memory.createdAt,
        })),
        createdAt: album.createdAt,
      },
    })
  } catch (error) {
    console.error("Get album error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Update album
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, coverImage } = req.body

    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({ message: "Album not found" })
    }

    // Check if user is the creator
    if (album.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied. You can only edit your own albums." })
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      {
        title: sanitizeInput(title) || album.title,
        description: sanitizeInput(description) || album.description,
        coverImage: sanitizeInput(coverImage) || album.coverImage,
      },
      { new: true },
    ).populate("createdBy", "name email")

    res.json({
      message: "Album updated successfully",
      album: {
        id: updatedAlbum._id,
        title: updatedAlbum.title,
        description: updatedAlbum.description,
        coverImage: updatedAlbum.coverImage,
        createdBy: updatedAlbum.createdBy,
        createdAt: updatedAlbum.createdAt,
      },
    })
  } catch (error) {
    console.error("Update album error:", error)
    res.status(500).json({
      message: "Server error during album update",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Delete album
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({ message: "Album not found" })
    }

    // Check if user is the creator
    if (album.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied. You can only delete your own albums." })
    }

    // Delete all memories in the album
    await Memory.deleteMany({ album: album._id })

    // Remove album from event
    await Event.findByIdAndUpdate(album.event, {
      $pull: { albums: album._id },
    })

    // Delete the album
    await Album.findByIdAndDelete(req.params.id)

    res.json({ message: "Album deleted successfully" })
  } catch (error) {
    console.error("Delete album error:", error)
    res.status(500).json({
      message: "Server error during album deletion",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

module.exports = router
