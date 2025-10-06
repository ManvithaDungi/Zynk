const express = require("express");
const router = express.Router();
const privacyManagerController = require("../controllers/privacyManagerController");
const Memory = require("../models/BulkCategorize");
const PrivacyManager = require("../models/PrivacyManager");

// GET all privacy settings
router.get("/", privacyManagerController.getAllPrivacySettings);

// get all groups
router.get("/groups", privacyManagerController.getAllGroups);

// Get All Users
router.get("/users", privacyManagerController.getAllUsers);

router.get("/memories", async (req, res) => {
  try {
    const memories = await Memory.find()
      .sort({ createdAt: -1 })
      .lean();

    const privacyDocs = await PrivacyManager.find().lean();
    const privacyMap = new Map(privacyDocs.map(doc => [doc.memoryId?.toString(), doc]));

    const merged = memories.map(mem => {
      const privacy = privacyMap.get(mem._id.toString());
      return {
        _id: mem._id,
        title: mem.title,
        description: mem.description,
        author: mem.author,
        category: mem.category,
        tags: mem.tags,
        imageUrl: mem.imageUrl,
        createdAt: mem.createdAt,
        visibility: privacy?.visibility || "public",   // default public
        settings: privacy?.settings || { allowDownload: true, allowSharing: true, allowComments: true }
      };
    });

    res.json(merged);
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json({ error: error.message });
  }
});


// GET privacy settings by memory ID
router.get(
  "/memory/:memoryId",
  privacyManagerController.getPrivacyByMemoryId
);

// POST create/update privacy settings
router.post("/", privacyManagerController.createOrUpdatePrivacy);

// PUT bulk update privacy settings
router.put("/bulk", privacyManagerController.bulkUpdatePrivacy);

// DELETE privacy settings
router.delete(
  "/:id",
  privacyManagerController.deletePrivacySettings
);

module.exports = router;
