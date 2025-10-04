import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
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
    category: "Other",
    maxAttendees: 100,
    thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const categories = useMemo(() => [
    "Conference", "Workshop", "Meetup", "Social", 
    "Sports", "Arts", "Music", "Other"
  ], []);

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

    // Max attendees validation
    const maxAttendees = Number.parseInt(formData.maxAttendees);
    if (isNaN(maxAttendees) || maxAttendees < 1) {
      newErrors.maxAttendees = "Maximum attendees must be at least 1";
    } else if (maxAttendees > 10000) {
      newErrors.maxAttendees = "Maximum attendees cannot exceed 10,000";
    }

    // Thumbnail validation (optional)
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear thumbnail error if exists
      if (errors.thumbnail) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "",
        }));
      }
    }

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage("");
    }
  }, [errors.thumbnail, successMessage]);

  const handleRemoveImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
    }));
    setThumbnailPreview(null);
    
    // Clear the file input
    const fileInput = document.getElementById('thumbnail');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'thumbnail' && formData[key]) {
          submitData.append('eventImage', formData[key]);
        } else if (key !== 'thumbnail') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await eventsAPI.create(submitData);
      setSuccessMessage("Event created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "Other",
        maxAttendees: 100,
        thumbnail: null,
      });
      setThumbnailPreview(null);

      // Clear file input
      const fileInput = document.getElementById('thumbnail');
      if (fileInput) {
        fileInput.value = '';
      }

      // Redirect to event details after a short delay
      setTimeout(() => {
        navigate(`/event/${response.data.event.id}`);
      }, 2000);
    } catch (error) {
      console.error("Create event error:", error);
      const errorMessage = error.response?.data?.message || "Failed to create event";

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "Other",
      maxAttendees: 100,
      thumbnail: null,
    });
    setErrors({});
    setSuccessMessage("");
    setThumbnailPreview(null);
    
    // Clear file input
    const fileInput = document.getElementById('thumbnail');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  // Get minimum date (today)
  const getMinDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  return (
    <div className="create-event-page">
      <Navbar />

      <div className="create-event-container">
        <div className="page-header">
          <h1>Create New Event</h1>
          <p>Bring people together by hosting your own event</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="create-event-form" noValidate encType="multipart/form-data">
            {errors.general && (
              <div className="form-error-message" role="alert">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="form-success-message" role="alert">
                {successMessage}
              </div>
            )}

            <div className="form-row">
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
                  placeholder="Enter a compelling event title"
                  required
                  maxLength={200}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <div id="title-error" className="form-error" role="alert">
                    {errors.title}
                  </div>
                )}
                <div className="character-count">{formData.title.length}/200</div>
              </div>
            </div>

            {/* Thumbnail Upload Section */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thumbnail" className="form-label">
                  Event Thumbnail
                </label>
                
                {!thumbnailPreview ? (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="image-upload-input"
                      aria-describedby={errors.thumbnail ? "thumbnail-error" : "thumbnail-help"}
                    />
                    <label htmlFor="thumbnail" className="image-upload-label">
                      <div className="image-upload-content">
                        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        <span className="upload-text">Click to upload event thumbnail</span>
                        <span className="upload-subtext">PNG, JPG, WebP up to 5MB</span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img src={thumbnailPreview} alt="Event thumbnail preview" className="preview-image" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="remove-image-btn"
                        aria-label="Remove image"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      </button>
                    </div>
                    <div className="image-info">
                      <span className="image-name">{formData.thumbnail?.name}</span>
                      <span className="image-size">
                        {formData.thumbnail ? (formData.thumbnail.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {errors.thumbnail && (
                  <div id="thumbnail-error" className="form-error" role="alert">
                    {errors.thumbnail}
                  </div>
                )}
                <div id="thumbnail-help" className="form-help">
                  Upload an attractive image to represent your event (optional)
                </div>
              </div>
            </div>

            <div className="form-row">
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
                  placeholder="Describe your event in detail. What can attendees expect?"
                  required
                  rows={6}
                  maxLength={2000}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <div id="description-error" className="form-error" role="alert">
                    {errors.description}
                  </div>
                )}
                <div className="character-count">{formData.description.length}/2000</div>
              </div>
            </div>

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
                  min={getMinDate()}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <div id="date-error" className="form-error" role="alert">
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
                  aria-describedby={errors.time ? "time-error" : undefined}
                />
                {errors.time && (
                  <div id="time-error" className="form-error" role="alert">
                    {errors.time}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
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
                  placeholder="Enter the event venue or address"
                  required
                  maxLength={300}
                  aria-describedby={errors.location ? "location-error" : undefined}
                />
                {errors.location && (
                  <div id="location-error" className="form-error" role="alert">
                    {errors.location}
                  </div>
                )}
                <div className="character-count">{formData.location.length}/300</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Event Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  aria-describedby="category-help"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div id="category-help" className="form-help">
                  Choose the category that best describes your event
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maxAttendees" className="form-label">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  className={`form-input ${errors.maxAttendees ? "error" : ""}`}
                  min={1}
                  max={10000}
                  aria-describedby={errors.maxAttendees ? "maxAttendees-error" : "maxAttendees-help"}
                />
                {errors.maxAttendees && (
                  <div id="maxAttendees-error" className="form-error" role="alert">
                    {errors.maxAttendees}
                  </div>
                )}
                <div id="maxAttendees-help" className="form-help">
                  Set the maximum number of people who can register
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleReset} 
                className="btn btn-secondary" 
                disabled={isSubmitting}
              >
                Reset Form
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
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
    </div>
  );
};

export default CreateEvent;