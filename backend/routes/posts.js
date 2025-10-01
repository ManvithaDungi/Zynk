// backend/routes/posts.js
const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const authenticate = require("../middleware/auth")
const Post = require("../models/Post")
const Album = require("../models/Album")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image and video files are allowed"))
  }
})

// Create new post with media
router.post("/", authenticate, upload.array("media", 10), async (req, res) => {
  try {
    const { albumId, caption } = req.body
    const files = req.files

    if (!albumId) {
      return res.status(400).json({ error: "Album ID is required" })
    }

    // Verify album belongs to user
    const album = await Album.findOne({ _id: albumId, user: req.user._id })
    if (!album) {
      return res.status(404).json({ error: "Album not found" })
    }

    // Process media files
    const media = []
    if (files && files.length > 0) {
      for (const file of files) {
        const mediaUrl = `/uploads/posts/${file.filename}`
        const mediaType = file.mimetype.startsWith("image") ? "image" : "video"

        media.push({
          url: mediaUrl,
          type: mediaType,
          filename: file.filename
        })
      }
    }

    // Create post
    const post = new Post({
      caption: caption || "",
      album: albumId,
      user: req.user._id,
      media: media
    })

    await post.save()
    await post.populate('user', 'name email')

    res.status(201).json({ post })
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ error: "Failed to create post" })
  }
})

// Get single post
router.get("/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findOne({ _id: postId, user: req.user._id })
      .populate('user', 'name email')
      .populate('album', 'title')

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    res.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

// Get all posts for an album
router.get("/album/:albumId", authenticate, async (req, res) => {
  try {
    const { albumId } = req.params

    // Verify album belongs to user
    const album = await Album.findOne({ _id: albumId, user: req.user._id })
    if (!album) {
      return res.status(404).json({ error: "Album not found" })
    }

    const posts = await Post.find({ album: albumId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

// Update post caption
router.put("/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params
    const { caption } = req.body

    const post = await Post.findOneAndUpdate(
      { _id: postId, user: req.user._id },
      { caption },
      { new: true }
    ).populate('user', 'name email')

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    res.json({ post })
  } catch (error) {
    console.error("Error updating post:", error)
    res.status(500).json({ error: "Failed to update post" })
  }
})

// Delete post
router.delete("/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findOneAndDelete({ _id: postId, user: req.user._id })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    res.status(500).json({ error: "Failed to delete post" })
  }
})

// Like/Unlike post
router.post("/:postId/like", authenticate, async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user._id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const existingLike = post.likes.find(like => like.user.toString() === userId.toString())

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== userId.toString())
    } else {
      // Like
      post.likes.push({ user: userId })
    }

    await post.save()

    res.json({ 
      message: existingLike ? "Post unliked" : "Post liked",
      likesCount: post.likes.length 
    })
  } catch (error) {
    console.error("Error liking post:", error)
    res.status(500).json({ error: "Failed to like post" })
  }
})

// Add comment to post
router.post("/:postId/comments", authenticate, async (req, res) => {
  try {
    const { postId } = req.params
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text is required" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim()
    })

    await post.save()
    await post.populate('comments.user', 'name email')

    const newComment = post.comments[post.comments.length - 1]
    res.status(201).json({ comment: newComment })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

// Delete comment
router.delete("/:postId/comments/:commentId", authenticate, async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const userId = req.user._id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    // Check if user owns the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this comment" })
    }

    comment.remove()
    await post.save()

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
})

module.exports = router