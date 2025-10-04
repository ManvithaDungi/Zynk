import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import CategoryTagSelector from "../../components/CategoryTagSelector/CategoryTagSelector";
import { eventsAPI } from "../../utils/api";
import "./CreateEvent.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    tags: [],
    maxAttendees: 100,
    thumbnail: null,
    // New enhanced features
    isRecurring: false,
    recurringPattern: "none",
    recurringEndDate: "",
    allowWaitlist: true,
    waitlistLimit: 50,
    allowChat: true,
    allowReviews: true,
    allowPolls: true,
    shareable: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Event date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Event date must be in the future";
      }
    }

    // Time validation
    if (!formData.time) {
      newErrors.time = "Event time is required";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Event location is required";
    } else if (formData.location.length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    } else if (formData.location.length > 300) {
      newErrors.location = "Location cannot exceed 300 characters";
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Event category is required";
    }

    // Max attendees validation
    const maxAttendees = Number.parseInt(formData.maxAttendees);
    if (isNaN(maxAttendees) || maxAttendees < 1) {
      newErrors.maxAttendees = "Maximum attendees must be at least 1";
    } else if (maxAttendees > 10000) {
      newErrors.maxAttendees = "Maximum attendees cannot exceed 10,000";
    }

    // Recurring event validation
    if (formData.isRecurring) {
      if (!formData.recurringPattern || formData.recurringPattern === "none") {
        newErrors.recurringPattern = "Please select a recurring pattern";
      }
      if (formData.recurringEndDate) {
        const endDate = new Date(formData.recurringEndDate);
        const startDate = new Date(formData.date);
        if (endDate <= startDate) {
          newErrors.recurringEndDate = "End date must be after the start date";
        }
      }
    }

    // Waitlist validation
    if (formData.allowWaitlist) {
      const waitlistLimit = Number.parseInt(formData.waitlistLimit);
      if (isNaN(waitlistLimit) || waitlistLimit < 1) {
        newErrors.waitlistLimit = "Waitlist limit must be at least 1";
      } else if (waitlistLimit > 1000) {
        newErrors.waitlistLimit = "Waitlist limit cannot exceed 1,000";
      }
    }

    // Thumbnail validation (optional but with constraints if provided)
    if (formData.thumbnail) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(formData.thumbnail.type)) {
        newErrors.thumbnail = "Please upload a valid image file (JPEG, PNG, or WebP)";
      } else if (formData.thumbnail.size > maxSize) {
        newErrors.thumbnail = "Image size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage("");
    }
  }, [errors, successMessage]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));

      // Create preview URL
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview(URL.createObjectURL(file));

      // Clear thumbnail error if exists
      if (errors.thumbnail) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, thumbnail: null }));
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview(null);
    }

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage("");
    }
  }, [errors, successMessage, thumbnailPreview]);

  const handleRemoveImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
    }));
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);

    // Clear the file input value
    const fileInput = document.getElementById('thumbnail');
    if (fileInput) {
      fileInput.value = '';
    }
  }, [thumbnailPreview]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const submitData = new FormData();
      
      // Append all form data fields
      Object.keys(formData).forEach(key => {
        if (key === 'thumbnail' && formData[key]) {
          submitData.append('eventImage', formData[key]);
        } else if (key === 'tags') {
          // Handle tags array
          formData[key].forEach(tagId => {
            submitData.append('tags[]', tagId);
          });
        } else if (key !== 'thumbnail') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await eventsAPI.create(submitData);
      
      setSuccessMessage("Event created successfully!");
      
      // Redirect to event detail page after a short delay
      setTimeout(() => {
        navigate(`/event/${response.data.event.id}`);
      }, 1500);

    } catch (error) {
      console.error("Error creating event:", error);
      setErrors({ submit: error.response?.data?.message || "Failed to create event" });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigate]);

  return (
    <div className="create-event-page">
      <Navbar />
      
      <div className="create-event-container">
        <div className="create-event-header">
          <h1>Create New Event</h1>
          <p>Share your event with the community and bring people together</p>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          {successMessage && (
            <div className="form-success-message">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="form-error-message">
              {errors.submit}
            </div>
          )}

          {/* Basic Event Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? "error" : ""}`}
                placeholder="Enter event title"
                required
              />
              {errors.title && (
                <div className="form-error" role="alert">
                  {errors.title}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Event Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? "error" : ""}`}
                placeholder="Describe your event..."
                rows="4"
                required
              />
              {errors.description && (
                <div className="form-error" role="alert">
                  {errors.description}
                </div>
              )}
            </div>

            {/* Category and Tags */}
            <CategoryTagSelector
              selectedCategory={formData.category}
              selectedTags={formData.tags}
              onCategoryChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              error={errors}
            />
          </div>

          {/* Event Details */}
          <div className="form-section">
            <h3>Event Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`form-input ${errors.date ? "error" : ""}`}
                  required
                />
                {errors.date && (
                  <div className="form-error" role="alert">
                    {errors.date}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="time" className="form-label">
                  Event Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`form-input ${errors.time ? "error" : ""}`}
                  required
                />
                {errors.time && (
                  <div className="form-error" role="alert">
                    {errors.time}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Event Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`form-input ${errors.location ? "error" : ""}`}
                placeholder="Enter event location"
                required
              />
              {errors.location && (
                <div className="form-error" role="alert">
                  {errors.location}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxAttendees" className="form-label">
                Maximum Attendees *
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                className={`form-input ${errors.maxAttendees ? "error" : ""}`}
                min="1"
                max="10000"
                required
              />
              {errors.maxAttendees && (
                <div className="form-error" role="alert">
                  {errors.maxAttendees}
                </div>
              )}
            </div>
          </div>

          {/* Event Image */}
          <div className="form-section">
            <h3>Event Image</h3>
            
            <div className="form-group">
              <label htmlFor="thumbnail" className="form-label">
                Event Thumbnail
              </label>
              <div className="image-upload-area">
                {thumbnailPreview ? (
                  <div className="image-preview">
                    <img src={thumbnailPreview} alt="Event preview" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="file-input"
                    />
                    <div className="upload-content">
                      <span className="upload-icon">📷</span>
                      <p>Click to upload event image</p>
                      <small>JPEG, PNG, WebP up to 5MB</small>
                    </div>
                  </div>
                )}
              </div>
              {errors.thumbnail && (
                <div className="form-error" role="alert">
                  {errors.thumbnail}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Features */}
          <div className="form-section">
            <h3>Event Features</h3>
            
            <div className="feature-options">
              <div className="feature-group">
                <label className="feature-label">
                  <input
                    type="checkbox"
                    name="allowWaitlist"
                    checked={formData.allowWaitlist}
                    onChange={handleInputChange}
                  />
                  <span className="feature-text">
                    <strong>Allow Waitlist</strong>
                    <small>Let people join a waitlist when event is full</small>
                  </span>
                </label>
                {formData.allowWaitlist && (
                  <div className="feature-settings">
                    <label htmlFor="waitlistLimit" className="form-label">
                      Waitlist Limit
                    </label>
                    <input
                      type="number"
                      id="waitlistLimit"
                      name="waitlistLimit"
                      value={formData.waitlistLimit}
                      onChange={handleInputChange}
                      className={`form-input ${errors.waitlistLimit ? "error" : ""}`}
                      min="1"
                      max="1000"
                    />
                    {errors.waitlistLimit && (
                      <div className="form-error" role="alert">
                        {errors.waitlistLimit}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="feature-group">
                <label className="feature-label">
                  <input
                    type="checkbox"
                    name="allowChat"
                    checked={formData.allowChat}
                    onChange={handleInputChange}
                  />
                  <span className="feature-text">
                    <strong>Enable Chat</strong>
                    <small>Allow attendees to chat during the event</small>
                  </span>
                </label>
              </div>

              <div className="feature-group">
                <label className="feature-label">
                  <input
                    type="checkbox"
                    name="allowReviews"
                    checked={formData.allowReviews}
                    onChange={handleInputChange}
                  />
                  <span className="feature-text">
                    <strong>Allow Reviews</strong>
                    <small>Let attendees rate and review the event</small>
                  </span>
                </label>
              </div>

              <div className="feature-group">
                <label className="feature-label">
                  <input
                    type="checkbox"
                    name="allowPolls"
                    checked={formData.allowPolls}
                    onChange={handleInputChange}
                  />
                  <span className="feature-text">
                    <strong>Allow Polls</strong>
                    <small>Let you create polls for attendees</small>
                  </span>
                </label>
              </div>

              <div className="feature-group">
                <label className="feature-label">
                  <input
                    type="checkbox"
                    name="shareable"
                    checked={formData.shareable}
                    onChange={handleInputChange}
                  />
                  <span className="feature-text">
                    <strong>Shareable</strong>
                    <small>Allow people to share this event on social media</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Recurring Events */}
          <div className="form-section">
            <h3>Recurring Events</h3>
            
            <div className="feature-group">
              <label className="feature-label">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                />
                <span className="feature-text">
                  <strong>Make this a recurring event</strong>
                  <small>Create multiple instances of this event</small>
                </span>
              </label>
            </div>

            {formData.isRecurring && (
              <div className="recurring-settings">
                <div className="form-group">
                  <label htmlFor="recurringPattern" className="form-label">
                    Recurring Pattern *
                  </label>
                  <select
                    id="recurringPattern"
                    name="recurringPattern"
                    value={formData.recurringPattern}
                    onChange={handleInputChange}
                    className={`form-select ${errors.recurringPattern ? "error" : ""}`}
                    required
                  >
                    <option value="none">Select pattern</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {errors.recurringPattern && (
                    <div className="form-error" role="alert">
                      {errors.recurringPattern}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="recurringEndDate" className="form-label">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="recurringEndDate"
                    name="recurringEndDate"
                    value={formData.recurringEndDate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.recurringEndDate ? "error" : ""}`}
                  />
                  {errors.recurringEndDate && (
                    <div className="form-error" role="alert">
                      {errors.recurringEndDate}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span className="loading-text">
                  <span className="loading-spinner-small"></span>
                  Creating Event...
                </span>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;