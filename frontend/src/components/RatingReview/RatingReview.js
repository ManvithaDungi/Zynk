import { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../../utils/api';
import './RatingReview.css';

const RatingReview = ({ eventId, canReview = false, isModal = false }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Review form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async (pageNum = 1, sort = 'newest') => {
    try {
      setLoading(pageNum === 1);
      const response = await reviewsAPI.getByEvent(eventId, {
        page: pageNum,
        limit: 10,
        sort
      });

      if (pageNum === 1) {
        setReviews(response.data.reviews);
      } else {
        setReviews(prev => [...prev, ...response.data.reviews]);
      }

      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setHasMore(response.data.pagination.current < response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch user's review
  const fetchUserReview = useCallback(async () => {
    try {
      const response = await reviewsAPI.getUserReview(eventId);
      setUserReview(response.data.review);
    } catch (error) {
      // User hasn't reviewed yet
      setUserReview(null);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews(page, sortBy);
    if (canReview) {
      fetchUserReview();
    }
  }, [fetchReviews, fetchUserReview, page, sortBy, canReview]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim()) return;

    try {
      setSubmitting(true);
      await reviewsAPI.create(eventId, {
        rating,
        review: reviewText
      });

      // Refresh reviews
      await fetchReviews(1, sortBy);
      await fetchUserReview();
      
      setShowReviewForm(false);
      setRating(0);
      setReviewText('');
      setReviewCount(prev => prev + 1);
      
      // Show success feedback
      alert('Review submitted successfully! 🎉');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle helpful vote
  const handleHelpfulVote = async (reviewId, helpful) => {
    try {
      await reviewsAPI.markHelpful(reviewId, { helpful });
      // Refresh reviews to update helpful count
      await fetchReviews(1, sortBy);
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  // Enhanced Star rating component with hover effects
  const StarRating = ({ rating, onRatingChange, readonly = false, interactive = false }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (interactive ? hoveredRating || rating : rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoveredRating(star)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );

  // Review card component
  const ReviewCard = ({ review }) => (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.user.avatar ? (
              <img src={review.user.avatar} alt={review.user.name} />
            ) : (
              <span>{review.user.name.charAt(0)}</span>
            )}
          </div>
          <div className="reviewer-details">
            <h4>{review.user.name}</h4>
            <div className="review-meta">
              <StarRating rating={review.rating} readonly={true} />
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {review.isVerified && (
          <span className="verified-badge">✓ Verified</span>
        )}
      </div>
      
      <div className="review-content">
        <p>{review.review}</p>
      </div>
      
      <div className="review-actions">
        <button
          className="helpful-btn"
          onClick={() => handleHelpfulVote(review.id, true)}
        >
          👍 Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="rating-review-section">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="rating-review-section">
      <div className="reviews-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <StarRating rating={Math.round(averageRating)} readonly={true} />
            <span className="rating-count">({totalReviews} reviews)</span>
            {reviewCount > 0 && (
              <span className="session-reviews">📝 {reviewCount} review{reviewCount !== 1 ? 's' : ''} this session</span>
            )}
          </div>
        </div>

        {canReview && !userReview && (
          <button
            className="btn btn-primary"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating *</label>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
              
              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || rating === 0 || !reviewText.trim()}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User's Review */}
      {userReview && (
        <div className="user-review">
          <h4>Your Review</h4>
          <ReviewCard review={userReview} />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="reviews-list">
          <div className="reviews-controls">
            <h4>Reviews</h4>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="reviews-grid">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMore && (
            <button
              className="btn btn-secondary load-more-btn"
              onClick={() => setPage(prev => prev + 1)}
            >
              Load More Reviews
            </button>
          )}
        </div>
      )}

      {reviews.length === 0 && !userReview && (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this event!</p>
        </div>
      )}
    </div>
  );
};

export default RatingReview;
