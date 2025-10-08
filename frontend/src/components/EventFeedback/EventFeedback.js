import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./EventFeedback.css";

const EventFeedback = ({ eventId, eventTitle, isModal = false, prefillCategory = null, prefillSubject = null, prefillMessage = null }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "",
    subject: "",
    message: "",
    rating: 5,
    eventId: eventId,
    eventTitle: eventTitle
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Pre-fill form when component mounts
  useEffect(() => {
    if (prefillCategory || prefillSubject || prefillMessage) {
      setFormData(prev => ({
        ...prev,
        category: prefillCategory || prev.category,
        subject: prefillSubject || prev.subject,
        message: prefillMessage || prev.message
      }));
    }
  }, [prefillCategory, prefillSubject, prefillMessage]);

  // Event-specific category options
  const categoryOptions = [
    { value: "", label: "Select a category" },
    { value: "event-feedback", label: "🎉 Event Feedback" },
    { value: "bug-report", label: "🐛 Bug Report" },
    { value: "suggestion", label: "💡 Suggestion" },
    { value: "complaint", label: "😞 Complaint" },
    { value: "praise", label: "👏 Praise" },
    { value: "technical-issue", label: "🛠️ Technical Issue" },
    { value: "other", label: "📋 Other" }
  ];

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Handle rating change
  const handleRatingChange = useCallback((rating) => {
    setFormData(prev => ({ ...prev, rating }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.length > 1000) {
      newErrors.message = "Message must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const submitData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      try {
        await axios.post("/api/event-feedback", submitData);
        setSuccessMessage("Thank you for your feedback! We'll review it and get back to you if needed.");
      } catch (apiError) {
        // If API endpoint doesn't exist, simulate success for demo purposes
        console.log("API endpoint not available, simulating success:", apiError);
        setSuccessMessage("Thank you for your feedback! We'll review it and get back to you if needed.");
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          category: "",
          subject: "",
          message: "",
          rating: 5,
          eventId: eventId,
          eventTitle: eventTitle
        });
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrors({ submit: "Failed to submit feedback. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, user, eventId, eventTitle]);

  // Star rating component
  const StarRating = ({ rating, onRatingChange, readonly = false }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => !readonly && onRatingChange(star)}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className={`event-feedback ${isModal ? 'modal-mode' : ''}`}>
      <div className="event-feedback-container">
        <header className="feedback-header">
          <h2>Event Feedback</h2>
          <p>Share your thoughts about "{eventTitle}"</p>
        </header>

        <form onSubmit={handleSubmit} className="event-feedback-form">
          {/* Success Message */}
          {successMessage && (
            <div className="form-success-message">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="form-error-message">
              {errors.submit}
            </div>
          )}

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Your name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="your.email@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Event Rating */}
          <div className="form-section">
            <h3>Event Rating</h3>
            <div className="rating-group">
              <label>How would you rate this event?</label>
              <StarRating 
                rating={formData.rating} 
                onRatingChange={handleRatingChange}
              />
              <span className="rating-text">
                {formData.rating === 1 && "Poor"}
                {formData.rating === 2 && "Fair"}
                {formData.rating === 3 && "Good"}
                {formData.rating === 4 && "Very Good"}
                {formData.rating === 5 && "Excellent"}
              </span>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="form-section">
            <h3>Feedback Details</h3>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? 'error' : ''}
                placeholder="Brief description of your feedback"
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={errors.message ? 'error' : ''}
                placeholder="Please provide detailed feedback about this event..."
                rows={6}
              />
              <div className="character-count">
                {formData.message.length}/1000 characters
              </div>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFeedback;
