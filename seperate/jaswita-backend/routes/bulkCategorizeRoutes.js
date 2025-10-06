const express = require("express");
const router = express.Router();
const Memory = require("../models/BulkCategorize");

//  Get all memories
router.get("/memories", async (req, res) => {
  try {
    const memories = await Memory.find()
      .sort({ createdAt: -1 })
      .select("title description imageUrl author category tags createdAt likes shares comments views");

    res.json(Array.isArray(memories) ? memories : []);
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json([]);
  }
});

//  Bulk update category + tags
router.post("/update", async (req, res) => {
  try {
    const { memoryIds, category, tags } = req.body;

    if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
      return res.status(400).json({ error: "Memory IDs are required" });
    }

    const updateData = { updatedAt: new Date() };
    if (category) updateData.category = category;
    if (tags && Array.isArray(tags)) updateData.tags = tags;

    console.log("Incoming update request:", req.body);
    const result = await Memory.updateMany(
      { _id: { $in: memoryIds } },
      { $set: updateData }
    );
    
    console.log("Update result:", result);
    res.json({
      message: "Memories updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating memories:", error);
    res.status(500).json({ error: "Failed to update memories" });
  }
});

//  Like a memory (increments likes)
router.post("/like/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const memory = await Memory.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 }, updatedAt: new Date() },
      { new: true }
    );

    if (!memory) return res.status(404).json({ error: "Memory not found" });

    res.json({ likes: memory.likes });
  } catch (error) {
    console.error("Error liking memory:", error);
    res.status(500).json({ error: "Failed to like memory" });
  }
});

//Share a memory (increments shares)
router.post("/share/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const memory = await Memory.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 }, updatedAt: new Date() },
      { new: true }
    );

    if (!memory) return res.status(404).json({ error: "Memory not found" });

    res.json({ shares: memory.shares });
  } catch (error) {
    console.error("Error sharing memory:", error);
    res.status(500).json({ error: "Failed to share memory" });
  }
});

// POST /api/bulkcategorize/memory
// Add at the top with your other routes
router.post("/create", async (req, res) => {
  try {
    const { title, description, author, imageUrl, category, tags } = req.body;
    if (!title || !description || !author) {
      return res.status(400).json({ error: "Title, description, and author are required" });
    }
    const memory = new Memory({
      title,
      description,
      author,
      imageUrl,
      category: category || "Uncategorized",
      tags: Array.isArray(tags) ? tags : [],
    });
    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    console.error("Error creating memory:", error);
    res.status(500).json({ error: "Failed to create memory" });
  }
});



// DELETE /api/bulkcategorize/memory/:id
// Add at the top with your other routes
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Memory.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Memory not found" });
    }
    res.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("Error deleting memory:", error);
    res.status(500).json({ error: "Failed to delete memory" });
  }
});



module.exports = router;

