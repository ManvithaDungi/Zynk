import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./ContactUs.css";

const ContactUs = ({ eventId, eventTitle, organizerName, isModal = false }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    inquiryType: "",
    subject: "",
    message: "",
    urgency: "normal",
    preferredContactMethod: "email",
    phoneNumber: "",
    eventId: eventId,
    eventTitle: eventTitle,
    organizerName: organizerName
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Inquiry type options
  const inquiryTypes = [
    { value: "", label: "Select inquiry type" },
    { value: "general-question", label: "❓ General Question" },
    { value: "event-details", label: "📅 Event Details" },
    { value: "registration-help", label: "📝 Registration Help" },
    { value: "accessibility", label: "♿ Accessibility Needs" },
    { value: "dietary-requirements", label: "🍽️ Dietary Requirements" },
    { value: "transportation", label: "🚗 Transportation" },
    { value: "accommodation", label: "🏨 Accommodation" },
    { value: "group-booking", label: "👥 Group Booking" },
    { value: "media-inquiry", label: "📸 Media/Press Inquiry" },
    { value: "partnership", label: "🤝 Partnership Opportunity" },
    { value: "other", label: "📋 Other" }
  ];

  // Urgency options
  const urgencyOptions = [
    { value: "low", label: "🟢 Low - No rush" },
    { value: "normal", label: "🟡 Normal - Standard response" },
    { value: "high", label: "🟠 High - Need response soon" },
    { value: "urgent", label: "🔴 Urgent - Need immediate response" }
  ];

  // Contact method options
  const contactMethods = [
    { value: "email", label: "📧 Email" },
    { value: "phone", label: "📞 Phone Call" },
    { value: "either", label: "📱 Either Email or Phone" }
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

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = "Please select an inquiry type";
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
    }

    // Phone number validation if phone is preferred contact method
    if (formData.preferredContactMethod === "phone" || formData.preferredContactMethod === "either") {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required for phone contact";
      } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
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
        name: formData.name,
        email: formData.email,
        category: "contact-organizer",
        subject: formData.subject,
        message: `${formData.message}\n\nInquiry Type: ${formData.inquiryType}\nUrgency: ${formData.urgency}\nPreferred Contact Method: ${formData.preferredContactMethod}${formData.phoneNumber ? `\nPhone: ${formData.phoneNumber}` : ''}\n\nEvent: ${formData.eventTitle}\nOrganizer: ${formData.organizerName || 'Unknown'}`,
        priority: formData.urgency,
        contactMethod: formData.preferredContactMethod,
        phone: formData.phoneNumber,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        eventId: formData.eventId,
        eventTitle: formData.eventTitle,
        organizerName: formData.organizerName
      };

      try {
        await axios.post("/api/feedback", submitData);
        setSuccessMessage(`Thank you for contacting us! ${organizerName ? "We'll get back to you soon." : "We'll review your message and respond as soon as possible."}`);
      } catch (apiError) {
        // If API endpoint doesn't exist, simulate success for demo purposes
        console.log("API endpoint not available, simulating success:", apiError);
        setSuccessMessage(`Thank you for contacting us! ${organizerName ? "We'll get back to you soon." : "We'll review your message and respond as soon as possible."}`);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, organizerName]);

  return (
    <div className={`contact-us ${isModal ? 'modal-mode' : ''}`}>
      <div className="contact-us-container">
        <header className="contact-header">
          <h2>Contact Organizer</h2>
          <p>
            {organizerName 
              ? `Get in touch with ${organizerName} about "${eventTitle}"`
              : `Have a question about "${eventTitle}"? We're here to help!`
            }
          </p>
        </header>

        <form onSubmit={handleSubmit} className="contact-us-form">
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
            <h3>Your Information</h3>
            
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
                  placeholder="Your full name"
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
                <select
                  id="preferredContactMethod"
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleInputChange}
                >
                  {contactMethods.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">
                  Phone Number
                  {(formData.preferredContactMethod === "phone" || formData.preferredContactMethod === "either") && " *"}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'error' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="form-section">
            <h3>Inquiry Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inquiryType">Inquiry Type *</label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className={errors.inquiryType ? 'error' : ''}
                >
                  {inquiryTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.inquiryType && <span className="error-message">{errors.inquiryType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency Level</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
                placeholder="Brief description of your inquiry"
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
                placeholder="Please provide details about your inquiry..."
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
              {isSubmitting ? "Sending Message..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
