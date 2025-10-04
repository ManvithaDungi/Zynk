const express = require("express")
const router = express.Router()
const analyticsFilterController = require("../controllers/analyticsFilterController")

// GET analytics data with filters
router.get("/", analyticsFilterController.getAnalyticsData)

// GET engagement metrics
router.get("/engagement", analyticsFilterController.getEngagementMetrics)

// GET user activity analytics
router.get("/user-activity", analyticsFilterController.getUserActivityAnalytics)

// POST save analytics filter preset
router.post("/presets", analyticsFilterController.saveAnalyticsPreset)

// GET analytics filter presets
router.get("/presets", analyticsFilterController.getAnalyticsPresets)

module.exports = router
