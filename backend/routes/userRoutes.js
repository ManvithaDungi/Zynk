const express = require("express")
const User = require('../models/User')
const { authMiddleware } = require("../utils/auth")
const { sanitizeInput } = require("../utils/validation")

const router = express.Router()

// Get all users (for admin purposes - simplified for now)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password").sort({ createdAt: -1 }).limit(50)

    res.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Get user by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("registeredEvents", "title date location")
      .populate("createdEvents", "title date location")
      .select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registeredEvents: user.registeredEvents,
        createdEvents: user.createdEvents,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Search users
router.get("/search/:query", authMiddleware, async (req, res) => {
  try {
    const query = sanitizeInput(req.params.query)

    if (!query || query.length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      })
    }

    const users = await User.find({
      isActive: true,
      $or: [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
    })
      .select("-password")
      .limit(20)

    res.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
      })),
    })
  } catch (error) {
    console.error("Search users error:", error)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, bio } = req.body
    const userId = req.params.id

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      bio: sanitizeInput(bio),
    }

    // Basic validation
    if (!sanitizedData.name || sanitizedData.name.trim().length === 0) {
      return res.status(400).json({
        message: "Name is required",
      })
    }

    if (sanitizedData.name.length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters",
      })
    }

    if (sanitizedData.bio && sanitizedData.bio.length > 500) {
      return res.status(400).json({
        message: "Bio cannot exceed 500 characters",
      })
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: sanitizedData.name,
        bio: sanitizedData.bio || "",
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registeredEvents: user.registeredEvents,
        createdEvents: user.createdEvents,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      message: "Server error during user update",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    // Soft delete by setting isActive to false
    await User.findByIdAndUpdate(userId, { isActive: false })

    res.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      message: "Server error during user deletion",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

module.exports = router
