const express = require('express');
const Review = require('../models/Review');
const Event = require('../models/Event');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get reviews for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOrder = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOrder = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortOrder = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find({ event: eventId })
      .populate('user', 'name email avatar')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ event: eventId });

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $match: { event: eventId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);

    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;
    const totalReviews = avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0;

    res.json({
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        review: review.review,
        user: {
          id: review.user._id,
          name: review.user.name,
          avatar: review.user.avatar
        },
        isVerified: review.isVerified,
        helpful: review.helpful.length,
        createdAt: review.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's review for an event
router.get('/event/:eventId/user', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const review = await Review.findOne({
      event: eventId,
      user: req.user.userId
    }).populate('user', 'name email avatar');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      review: {
        id: review._id,
        rating: review.rating,
        review: review.review,
        user: {
          id: review.user._id,
          name: review.user.name,
          avatar: review.user.avatar
        },
        isVerified: review.isVerified,
        helpful: review.helpful.length,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create or update review
router.post('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, review } = req.body;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!review || review.trim().length === 0) {
      return res.status(400).json({ message: 'Review text is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered for the event
    if (!event.registeredUsers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You can only review events you have attended' });
    }

    // Check if event has ended
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ message: 'You can only review events after they have ended' });
    }

    const reviewData = {
      event: eventId,
      user: req.user.userId,
      rating: parseInt(rating),
      review: sanitizeString(review)
    };

    // Use upsert to create or update review
    const savedReview = await Review.findOneAndUpdate(
      { event: eventId, user: req.user.userId },
      reviewData,
      { upsert: true, new: true }
    ).populate('user', 'name email avatar');

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        id: savedReview._id,
        rating: savedReview.rating,
        review: savedReview.review,
        user: {
          id: savedReview.user._id,
          name: savedReview.user.name,
          avatar: savedReview.user.avatar
        },
        isVerified: savedReview.isVerified,
        helpful: savedReview.helpful.length,
        createdAt: savedReview.createdAt
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already marked this review
    const existingHelpful = review.helpful.find(
      h => h.user.toString() === req.user.userId
    );

    if (existingHelpful) {
      // Update existing helpful vote
      existingHelpful.helpful = helpful;
    } else {
      // Add new helpful vote
      review.helpful.push({
        user: req.user.userId,
        helpful: helpful
      });
    }

    await review.save();

    res.json({
      message: 'Review helpful status updated',
      helpful: review.helpful.length
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
