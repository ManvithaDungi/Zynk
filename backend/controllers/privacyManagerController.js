const PrivacyManager = require("../models/PrivacyManager");
const User = require("../models/User");
const Group = require("../models/Group");

// Get all privacy settings
exports.getAllPrivacySettings = async (req, res) => {
  try {
    const privacySettings = await PrivacyManager.find().populate(
      "memoryId"
    );
    res.json(privacySettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().select(
      "name description members"
    );
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get privacy settings by memory ID
exports.getPrivacyByMemoryId = async (req, res) => {
  try {
    const privacySettings = await PrivacyManager.findOne({
      memoryId: req.params.memoryId,
    });
    if (!privacySettings) {
      return res
        .status(404)
        .json({ error: "Privacy settings not found" });
    }
    res.json(privacySettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update privacy settings
exports.createOrUpdatePrivacy = async (req, res) => {
  try {
    const { memoryId } = req.body;

    let privacySettings = await PrivacyManager.findOne({
      memoryId,
    });

    if (privacySettings) {
      // Update existing
      privacySettings = await PrivacyManager.findOneAndUpdate(
        { memoryId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      // Create new
      privacySettings = new PrivacyManager(req.body);
      await privacySettings.save();
    }

    res.json(privacySettings);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Bulk update privacy settings
exports.bulkUpdatePrivacy = async (req, res) => {
  try {
    const { memoryIds, privacySettings } = req.body;

    const updatePromises = memoryIds.map((memoryId) =>
      PrivacyManager.findOneAndUpdate(
        { memoryId },
        { ...privacySettings, memoryId },
        { new: true, upsert: true, runValidators: true }
      )
    );

    const results = await Promise.all(updatePromises);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete privacy settings
exports.deletePrivacySettings = async (req, res) => {
  try {
    const privacySettings =
      await PrivacyManager.findByIdAndDelete(req.params.id);
    if (!privacySettings) {
      return res
        .status(404)
        .json({ error: "Privacy settings not found" });
    }
    res.json({
      message: "Privacy settings deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
