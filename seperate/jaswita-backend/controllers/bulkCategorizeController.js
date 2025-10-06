const Memory = require("../models/BulkCategorize")

class BulkCategorizeController {
  // Get memories with pagination and filtering
  async getMemories(req, res) {
    try {
      const { eventId = "event-123", page = 1, limit = 20, category, tags, search } = req.query

      const query = { eventId }

      // Add filters
      if (category && category !== "all") {
        query.category = category
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags]
        query.tags = { $in: tagArray }
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ]
      }

      const skip = (page - 1) * limit

      const [memories, total] = await Promise.all([
        Memory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .select("title description imageUrl author category tags createdAt"),
        Memory.countDocuments(query),
      ])

      res.json({
        memories,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Error in getMemories:", error)
      res.status(500).json({ error: "Failed to fetch memories" })
    }
  }

  // Bulk update memories
  async bulkUpdate(req, res) {
    try {
      const { memoryIds, category, tags, action = "update" } = req.body

      if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
        return res.status(400).json({ error: "Memory IDs are required" })
      }

      let updateData = { updatedAt: new Date() }

      switch (action) {
        case "update":
          if (category) updateData.category = category
          if (tags && Array.isArray(tags)) updateData.tags = tags
          break

        case "addTags":
          if (tags && Array.isArray(tags)) {
            updateData = { $addToSet: { tags: { $each: tags } }, updatedAt: new Date() }
          }
          break

        case "removeTags":
          if (tags && Array.isArray(tags)) {
            updateData = { $pullAll: { tags: tags }, updatedAt: new Date() }
          }
          break

        case "clearCategory":
          updateData.category = "Uncategorized"
          break

        default:
          return res.status(400).json({ error: "Invalid action" })
      }

      const result = await Memory.updateMany(
        { _id: { $in: memoryIds } },
        action === "addTags" || action === "removeTags" ? updateData : { $set: updateData },
      )

      res.json({
        message: `Memories ${action}d successfully`,
        modifiedCount: result.modifiedCount,
        action,
      })
    } catch (error) {
      console.error("Error in bulkUpdate:", error)
      res.status(500).json({ error: "Failed to update memories" })
    }
  }

  // Get available categories and tags
  async getMetadata(req, res) {
    try {
      const { eventId = "event-123" } = req.query

      const [categories, tags] = await Promise.all([
        Memory.distinct("category", { eventId }),
        Memory.distinct("tags", { eventId }),
      ])

      res.json({
        categories: categories.filter((cat) => cat && cat !== ""),
        tags: tags.filter((tag) => tag && tag !== ""),
      })
    } catch (error) {
      console.error("Error in getMetadata:", error)
      res.status(500).json({ error: "Failed to fetch metadata" })
    }
  }

  // Get categorization statistics
  async getStats(req, res) {
    try {
      const { eventId = "event-123" } = req.query

      const [categoryStats, tagStats, totalMemories] = await Promise.all([
        Memory.aggregate([
          { $match: { eventId } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Memory.aggregate([
          { $match: { eventId } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),
        Memory.countDocuments({ eventId }),
      ])

      const uncategorized = await Memory.countDocuments({
        eventId,
        $or: [{ category: "Uncategorized" }, { category: { $exists: false } }, { category: "" }],
      })

      res.json({
        total: totalMemories,
        uncategorized,
        categorized: totalMemories - uncategorized,
        categories: categoryStats,
        popularTags: tagStats,
      })
    } catch (error) {
      console.error("Error in getStats:", error)
      res.status(500).json({ error: "Failed to fetch statistics" })
    }
  }
}

module.exports = new BulkCategorizeController()
