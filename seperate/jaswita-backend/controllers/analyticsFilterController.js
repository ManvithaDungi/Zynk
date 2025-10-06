const AnalyticsFilter = require("../models/AnalyticsFilter");
const Memory = require("../models/BulkCategorize"); // Reusing the Memory model

// Get analytics data with filters
exports.getAnalyticsData = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};

    const result = await Memory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" },
          totalMemories: { $sum: 1 },
          totalComments: { $sum: "$comments" },
          totalViews: { $sum: "$views" },
          totalShares: { $sum: "$shares" },
          earliestMemory: { $min: "$createdAt" },
          latestMemory: { $max: "$createdAt" },
        },
      },
    ]);

    res.json(
      result[0] || {
        totalLikes: 0,
        totalMemories: 0,
        totalComments: 0,
        totalViews: 0,
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get engagement metrics
exports.getEngagementMetrics = async (req, res) => {
  try {
    const { eventId, timeframe } = req.query;

    const dateFilter = {};
    if (timeframe) {
      const now = new Date();
      const daysBack =
        timeframe === "week"
          ? 7
          : timeframe === "month"
          ? 30
          : 365;
      dateFilter.createdAt = {
        $gte: new Date(
          now.getTime() - daysBack * 24 * 60 * 60 * 1000
        ),
      };
    }

    const filter = eventId
      ? { eventId, ...dateFilter }
      : dateFilter;

    const engagementData = await Memory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: "$comments" },
          totalShares: { $sum: "$shares" },
          avgLikes: { $avg: "$likes" },
          avgComments: { $avg: "$comments" },
          avgShares: { $avg: "$shares" },
        },
      },
    ]);

    res.json(engagementData[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user activity analytics
exports.getUserActivityAnalytics = async (req, res) => {
  try {
    const { eventId } = req.query;

    const filter = eventId ? { eventId } : {};

    const userActivity = await Memory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$userId",
          memoriesCount: { $sum: 1 },
          totalEngagement: {
            $sum: { $add: ["$likes", "$comments", "$shares"] },
          },
        },
      },
      { $sort: { memoriesCount: -1 } },
      { $limit: 10 },
    ]);

    res.json(userActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Save analytics filter preset
exports.saveAnalyticsPreset = async (req, res) => {
  try {
    const preset = new AnalyticsFilter(req.body);
    await preset.save();
    res.status(201).json(preset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get analytics filter presets
exports.getAnalyticsPresets = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { createdBy: userId } : {};

    const presets = await AnalyticsFilter.find(filter).sort({
      createdAt: -1,
    });
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
