import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./Feedback.css";

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "",
    subject: "",
    message: "",
    priority: "medium",
    rating: 5,
    attachment: null,
    subscribe: false,
    contactMethod: "email",
    phone: "",
    bestTimeToContact: "",
    hearAboutUs: "",
    recommendToFriend: "",
    improvements: []
  });

  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Category options
  const categoryOptions = [
    { value: "", label: "Select a category" },
    { value: "bug-report", label: "🐛 Bug Report" },
    { value: "feature-request", label: "✨ Feature Request" },
    { value: "general-feedback", label: "💬 General Feedback" },
    { value: "technical-support", label: "🛠️ Technical Support" },
    { value: "account-issue", label: "👤 Account Issue" },
    { value: "payment-billing", label: "💳 Payment/Billing" },
    { value: "partnership", label: "🤝 Partnership Inquiry" },
    { value: "other", label: "📋 Other" }
  ];

  // Improvement options (checkboxes)
  const improvementOptions = [
    "User Interface",
    "Performance",
    "Mobile Experience",
    "Documentation",
    "Customer Support",
    "New Features",
    "Bug Fixes",
    "Security"
  ];

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Handle improvement toggle
  const handleImprovementToggle = useCallback((improvement) => {
    setFormData(prev => ({
      ...prev,
      improvements: prev.improvements.includes(improvement)
        ? prev.improvements.filter(i => i !== improvement)
        : [...prev.improvements, improvement]
    }));
  }, []);

  // Handle rating change
  const handleRatingChange = useCallback((rating) => {
    setFormData(prev => ({ ...prev, rating }));
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        attachment: "File size must be less than 10MB" 
      }));
      return;
    }

    setFormData(prev => ({ ...prev, attachment: file }));

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(file.name);
    }

    // Clear error
    if (errors.attachment) {
      setErrors(prev => ({ ...prev, attachment: "" }));
    }
  }, [errors]);

  // Remove attachment
  const handleRemoveAttachment = useCallback(() => {
    setFormData(prev => ({ ...prev, attachment: null }));
    setAttachmentPreview(null);
    
    const fileInput = document.getElementById('attachment');
    if (fileInput) {
      fileInput.value = '';
    }
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
    } else if (formData.message.length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    } else if (formData.message.length > 2000) {
      newErrors.message = "Message must be less than 2000 characters";
    }

    if (formData.contactMethod === "phone" && !formData.phone) {
      newErrors.phone = "Phone number is required when phone is selected as contact method";
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
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
      const submitData = new FormData();

      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === "attachment" && formData[key]) {
          submitData.append("attachment", formData[key]);
        } else if (key === "improvements") {
          submitData.append("improvements", JSON.stringify(formData[key]));
        } else if (key !== "attachment") {
          submitData.append(key, formData[key]);
        }
      });

      await axios.post("/api/feedback", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessMessage("Thank you for your feedback! We'll get back to you soon.");
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          category: "",
          subject: "",
          message: "",
          priority: "medium",
          rating: 5,
          attachment: null,
          subscribe: false,
          contactMethod: "email",
          phone: "",
          bestTimeToContact: "",
          hearAboutUs: "",
          recommendToFriend: "",
          improvements: []
        });
        setAttachmentPreview(null);
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to submit feedback. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, validateForm]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        category: "",
        subject: "",
        message: "",
        priority: "medium",
        rating: 5,
        attachment: null,
        subscribe: false,
        contactMethod: "email",
        phone: "",
        bestTimeToContact: "",
        hearAboutUs: "",
        recommendToFriend: "",
        improvements: []
      });
      setAttachmentPreview(null);
      setErrors({});
      setSuccessMessage("");
    }
  }, [user]);

  return (
    <div className="feedback-page">
      <Navbar />

      <div className="feedback-container">
        <header className="page-header">
          <h1>We'd Love Your Feedback</h1>
          <p>Help us improve by sharing your thoughts, suggestions, or reporting issues</p>
        </header>

        <form onSubmit={handleSubmit} className="feedback-form">
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

          {/* Section 1: Contact Information */}
          <div className="form-section">
            <h2 className="form-section-title">Contact Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="John Doe"
                  required
                />
                {errors.name && (
                  <div className="form-error">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label required">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="john.doe@example.com"
                  required
                />
                {errors.email && (
                  <div className="form-error">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Contact Method</label>
              <div className="radio-group-inline">
                <label className="radio-option-inline">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === "email"}
                    onChange={handleInputChange}
                  />
                  <span>📧 Email</span>
                </label>
                <label className="radio-option-inline">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={formData.contactMethod === "phone"}
                    onChange={handleInputChange}
                  />
                  <span>📞 Phone</span>
                </label>
                <label className="radio-option-inline">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="none"
                    checked={formData.contactMethod === "none"}
                    onChange={handleInputChange}
                  />
                  <span>🚫 No Contact Needed</span>
                </label>
              </div>
            </div>

            {formData.contactMethod === "phone" && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label required">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <div className="form-error">{errors.phone}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="bestTimeToContact" className="form-label">
                    Best Time to Contact
                  </label>
                  <select
                    id="bestTimeToContact"
                    name="bestTimeToContact"
                    value={formData.bestTimeToContact}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select a time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Feedback Details */}
          <div className="form-section">
            <h2 className="form-section-title">Feedback Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label required">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`form-select ${errors.category ? "error" : ""}`}
                  required
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="form-error">{errors.category}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label required">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`form-input ${errors.subject ? "error" : ""}`}
                placeholder="Brief summary of your feedback"
                required
              />
              {errors.subject && (
                <div className="form-error">{errors.subject}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label required">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={`form-textarea ${errors.message ? "error" : ""}`}
                placeholder="Please provide detailed information about your feedback..."
                rows="6"
                maxLength="2000"
                required
              />
              <div className="character-count">
                {formData.message.length}/2000
              </div>
              {errors.message && (
                <div className="form-error">{errors.message}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="attachment" className="form-label">
                Attachment (Optional)
              </label>
              <p className="form-help">
                Upload screenshots, documents, or any relevant files (Max 10MB)
              </p>
              
              {!attachmentPreview ? (
                <input
                  type="file"
                  id="attachment"
                  onChange={handleFileChange}
                  className="file-input"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                />
              ) : (
                <div className="attachment-preview">
                  {typeof attachmentPreview === "string" && attachmentPreview.startsWith("data:") ? (
                    <img src={attachmentPreview} alt="Attachment preview" />
                  ) : (
                    <div className="file-preview">
                      <span>📎</span>
                      <p>{attachmentPreview}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="btn-remove-attachment"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              {errors.attachment && (
                <div className="form-error">{errors.attachment}</div>
              )}
            </div>
          </div>

          {/* Section 3: Rating & Experience */}
          <div className="form-section">
            <h2 className="form-section-title">Rate Your Experience</h2>
            
            <div className="form-group">
              <label className="form-label">
                Overall Satisfaction
              </label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`star-btn ${star <= formData.rating ? "active" : ""}`}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-label">
                  {formData.rating === 1 && "Very Dissatisfied"}
                  {formData.rating === 2 && "Dissatisfied"}
                  {formData.rating === 3 && "Neutral"}
                  {formData.rating === 4 && "Satisfied"}
                  {formData.rating === 5 && "Very Satisfied"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Would you recommend us to a friend?
              </label>
              <div className="range-group">
                <input
                  type="range"
                  name="recommendToFriend"
                  min="0"
                  max="10"
                  value={formData.recommendToFriend}
                  onChange={handleInputChange}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>Not Likely (0)</span>
                  <span className="range-value">{formData.recommendToFriend || 5}</span>
                  <span>Very Likely (10)</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                What areas need improvement? (Select all that apply)
              </label>
              <div className="improvements-grid">
                {improvementOptions.map(improvement => (
                  <label key={improvement} className="improvement-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.improvements.includes(improvement)}
                      onChange={() => handleImprovementToggle(improvement)}
                    />
                    <span>{improvement}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="form-section">
            <h2 className="form-section-title">Additional Information</h2>
            
            <div className="form-group">
              <label htmlFor="hearAboutUs" className="form-label">
                How did you hear about us?
              </label>
              <select
                id="hearAboutUs"
                name="hearAboutUs"
                value={formData.hearAboutUs}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select an option</option>
                <option value="search-engine">Search Engine (Google, Bing, etc.)</option>
                <option value="social-media">Social Media</option>
                <option value="friend-referral">Friend or Colleague</option>
                <option value="advertisement">Advertisement</option>
                <option value="blog-article">Blog or Article</option>
                <option value="app-store">App Store</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleInputChange}
                />
                <span>Subscribe to our newsletter for updates and announcements</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span className="loading-text">
                  <span className="loading-spinner-small"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;

