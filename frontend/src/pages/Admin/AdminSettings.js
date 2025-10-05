import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    // Site Configuration
    siteName: "Zynk",
    siteTagline: "Connect Through Events",
    siteDescription: "",
    siteLogo: null,
    siteFavicon: null,
    
    // Theme Settings
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#666666",
    themeMode: "light",
    
    // Feature Toggles
    enableRegistration: true,
    enableEvents: true,
    enableAlbums: true,
    enableMemories: true,
    enableComments: true,
    enableReviews: true,
    enableChat: true,
    enableNotifications: true,
    enableAnalytics: true,
    
    // Privacy & Security
    defaultPostVisibility: "public",
    requireEmailVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 6,
    
    // Content Moderation
    autoModeration: false,
    profanityFilter: true,
    spamFilter: true,
    moderationLevel: "medium",
    
    // Email Settings
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    emailFrom: "",
    emailFromName: "",
    
    // Upload Settings
    maxFileSize: 5,
    allowedFileTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
    maxImagesPerPost: 10,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
    
    // Social Media Links
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    
    // Analytics
    googleAnalyticsId: "",
    facebookPixelId: "",
    
    // Legal
    termsOfServiceUrl: "",
    privacyPolicyUrl: "",
    contactEmail: "",
    supportEmail: ""
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/settings");
        const settings = response.data.settings;
        
        setFormData(prev => ({
          ...prev,
          ...settings
        }));

        if (settings.siteLogo) {
          setLogoPreview(settings.siteLogo);
        }
        if (settings.siteFavicon) {
          setFaviconPreview(settings.siteFavicon);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setErrors({ fetch: "Failed to load settings" });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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

  // Handle file types change
  const handleFileTypeToggle = useCallback((fileType) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter(t => t !== fileType)
        : [...prev.allowedFileTypes, fileType]
    }));
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: "File size must be less than 2MB" 
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: "Only image files are allowed" 
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [type]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "siteLogo") {
        setLogoPreview(reader.result);
      } else {
        setFaviconPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: "" }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.siteName.trim()) {
      newErrors.siteName = "Site name is required";
    }

    if (formData.smtpHost && !formData.smtpUser) {
      newErrors.smtpUser = "SMTP username is required when SMTP host is set";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailFrom && !emailRegex.test(formData.emailFrom)) {
      newErrors.emailFrom = "Invalid email format";
    }

    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }

    if (formData.supportEmail && !emailRegex.test(formData.supportEmail)) {
      newErrors.supportEmail = "Invalid email format";
    }

    if (formData.sessionTimeout < 5 || formData.sessionTimeout > 1440) {
      newErrors.sessionTimeout = "Session timeout must be between 5 and 1440 minutes";
    }

    if (formData.passwordMinLength < 6 || formData.passwordMinLength > 32) {
      newErrors.passwordMinLength = "Password min length must be between 6 and 32";
    }

    if (formData.maxFileSize < 1 || formData.maxFileSize > 50) {
      newErrors.maxFileSize = "Max file size must be between 1 and 50 MB";
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
        if (key === "siteLogo" && formData[key]) {
          submitData.append("siteLogo", formData[key]);
        } else if (key === "siteFavicon" && formData[key]) {
          submitData.append("siteFavicon", formData[key]);
        } else if (key === "allowedFileTypes") {
          submitData.append("allowedFileTypes", JSON.stringify(formData[key]));
        } else if (key !== "siteLogo" && key !== "siteFavicon") {
          submitData.append(key, formData[key]);
        }
      });

      await axios.put("/api/admin/settings", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessMessage("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error saving settings:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to save settings" 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <header className="settings-header">
        <h2>Site Settings</h2>
        <p>Configure your application's global settings and preferences</p>
      </header>

      <form onSubmit={handleSubmit} className="settings-form">
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

        {/* Section 1: Site Configuration */}
        <div className="form-section">
          <h3 className="form-section-title">Site Configuration</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="siteName" className="form-label required">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                className={`form-input ${errors.siteName ? "error" : ""}`}
                placeholder="Zynk"
                required
              />
              {errors.siteName && (
                <div className="form-error">{errors.siteName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="siteTagline" className="form-label">
                Site Tagline
              </label>
              <input
                type="text"
                id="siteTagline"
                name="siteTagline"
                value={formData.siteTagline}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Connect Through Events"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="siteDescription" className="form-label">
              Site Description
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={formData.siteDescription}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="A brief description of your platform..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="siteLogo" className="form-label">
                Site Logo
              </label>
              {logoPreview && (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                </div>
              )}
              <input
                type="file"
                id="siteLogo"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "siteLogo")}
                className="file-input"
              />
              {errors.siteLogo && (
                <div className="form-error">{errors.siteLogo}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="siteFavicon" className="form-label">
                Site Favicon
              </label>
              {faviconPreview && (
                <div className="favicon-preview">
                  <img src={faviconPreview} alt="Favicon preview" />
                </div>
              )}
              <input
                type="file"
                id="siteFavicon"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "siteFavicon")}
                className="file-input"
              />
              {errors.siteFavicon && (
                <div className="form-error">{errors.siteFavicon}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Theme Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Theme Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primaryColor" className="form-label">
                Primary Color
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="form-color"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  name="primaryColor"
                  className="form-input"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="secondaryColor" className="form-label">
                Secondary Color
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="form-color"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  name="secondaryColor"
                  className="form-input"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="accentColor" className="form-label">
                Accent Color
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="accentColor"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleInputChange}
                  className="form-color"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={handleInputChange}
                  name="accentColor"
                  className="form-input"
                  placeholder="#666666"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="themeMode" className="form-label">
              Default Theme Mode
            </label>
            <select
              id="themeMode"
              name="themeMode"
              value={formData.themeMode}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Feature Toggles */}
        <div className="form-section">
          <h3 className="form-section-title">Feature Toggles</h3>
          <p className="form-help">Enable or disable specific features across the platform</p>
          
          <div className="features-grid">
            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableRegistration"
                checked={formData.enableRegistration}
                onChange={handleInputChange}
              />
              <span>User Registration</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableEvents"
                checked={formData.enableEvents}
                onChange={handleInputChange}
              />
              <span>Events</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableAlbums"
                checked={formData.enableAlbums}
                onChange={handleInputChange}
              />
              <span>Albums</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableMemories"
                checked={formData.enableMemories}
                onChange={handleInputChange}
              />
              <span>Memories</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableComments"
                checked={formData.enableComments}
                onChange={handleInputChange}
              />
              <span>Comments</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableReviews"
                checked={formData.enableReviews}
                onChange={handleInputChange}
              />
              <span>Reviews & Ratings</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableChat"
                checked={formData.enableChat}
                onChange={handleInputChange}
              />
              <span>Chat</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableNotifications"
                checked={formData.enableNotifications}
                onChange={handleInputChange}
              />
              <span>Notifications</span>
            </label>

            <label className="feature-toggle">
              <input
                type="checkbox"
                name="enableAnalytics"
                checked={formData.enableAnalytics}
                onChange={handleInputChange}
              />
              <span>Analytics</span>
            </label>
          </div>
        </div>

        {/* Section 4: Privacy & Security */}
        <div className="form-section">
          <h3 className="form-section-title">Privacy & Security</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="defaultPostVisibility" className="form-label">
                Default Post Visibility
              </label>
              <select
                id="defaultPostVisibility"
                name="defaultPostVisibility"
                value={formData.defaultPostVisibility}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sessionTimeout" className="form-label">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={formData.sessionTimeout}
                onChange={handleInputChange}
                className={`form-input ${errors.sessionTimeout ? "error" : ""}`}
                min="5"
                max="1440"
              />
              {errors.sessionTimeout && (
                <div className="form-error">{errors.sessionTimeout}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passwordMinLength" className="form-label">
                Minimum Password Length
              </label>
              <input
                type="number"
                id="passwordMinLength"
                name="passwordMinLength"
                value={formData.passwordMinLength}
                onChange={handleInputChange}
                className={`form-input ${errors.passwordMinLength ? "error" : ""}`}
                min="6"
                max="32"
              />
              {errors.passwordMinLength && (
                <div className="form-error">{errors.passwordMinLength}</div>
              )}
            </div>
          </div>

          <div className="security-options">
            <label className="security-checkbox">
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={formData.requireEmailVerification}
                onChange={handleInputChange}
              />
              <span>Require Email Verification</span>
            </label>

            <label className="security-checkbox">
              <input
                type="checkbox"
                name="enableTwoFactor"
                checked={formData.enableTwoFactor}
                onChange={handleInputChange}
              />
              <span>Enable Two-Factor Authentication</span>
            </label>
          </div>
        </div>

        {/* Section 5: Content Moderation */}
        <div className="form-section">
          <h3 className="form-section-title">Content Moderation</h3>
          
          <div className="form-group">
            <label htmlFor="moderationLevel" className="form-label">
              Moderation Level
            </label>
            <select
              id="moderationLevel"
              name="moderationLevel"
              value={formData.moderationLevel}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="low">Low - Minimal filtering</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - Strict filtering</option>
            </select>
          </div>

          <div className="moderation-options">
            <label className="moderation-checkbox">
              <input
                type="checkbox"
                name="autoModeration"
                checked={formData.autoModeration}
                onChange={handleInputChange}
              />
              <span>Automatic Moderation</span>
            </label>

            <label className="moderation-checkbox">
              <input
                type="checkbox"
                name="profanityFilter"
                checked={formData.profanityFilter}
                onChange={handleInputChange}
              />
              <span>Profanity Filter</span>
            </label>

            <label className="moderation-checkbox">
              <input
                type="checkbox"
                name="spamFilter"
                checked={formData.spamFilter}
                onChange={handleInputChange}
              />
              <span>Spam Filter</span>
            </label>
          </div>
        </div>

        {/* Section 6: Email Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Email Settings (SMTP)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="smtpHost" className="form-label">
                SMTP Host
              </label>
              <input
                type="text"
                id="smtpHost"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="smtp.example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtpPort" className="form-label">
                SMTP Port
              </label>
              <input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleInputChange}
                className="form-input"
                placeholder="587"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="smtpUser" className="form-label">
                SMTP Username
              </label>
              <input
                type="text"
                id="smtpUser"
                name="smtpUser"
                value={formData.smtpUser}
                onChange={handleInputChange}
                className={`form-input ${errors.smtpUser ? "error" : ""}`}
                placeholder="username"
              />
              {errors.smtpUser && (
                <div className="form-error">{errors.smtpUser}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="smtpPassword" className="form-label">
                SMTP Password
              </label>
              <input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                value={formData.smtpPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emailFrom" className="form-label">
                From Email
              </label>
              <input
                type="email"
                id="emailFrom"
                name="emailFrom"
                value={formData.emailFrom}
                onChange={handleInputChange}
                className={`form-input ${errors.emailFrom ? "error" : ""}`}
                placeholder="noreply@example.com"
              />
              {errors.emailFrom && (
                <div className="form-error">{errors.emailFrom}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="emailFromName" className="form-label">
                From Name
              </label>
              <input
                type="text"
                id="emailFromName"
                name="emailFromName"
                value={formData.emailFromName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Zynk Team"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Upload Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Upload Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxFileSize" className="form-label">
                Max File Size (MB)
              </label>
              <input
                type="number"
                id="maxFileSize"
                name="maxFileSize"
                value={formData.maxFileSize}
                onChange={handleInputChange}
                className={`form-input ${errors.maxFileSize ? "error" : ""}`}
                min="1"
                max="50"
              />
              {errors.maxFileSize && (
                <div className="form-error">{errors.maxFileSize}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxImagesPerPost" className="form-label">
                Max Images Per Post
              </label>
              <input
                type="number"
                id="maxImagesPerPost"
                name="maxImagesPerPost"
                value={formData.maxImagesPerPost}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allowed File Types</label>
            <div className="file-types-grid">
              {[
                { value: "image/jpeg", label: "JPEG Images" },
                { value: "image/png", label: "PNG Images" },
                { value: "image/gif", label: "GIF Images" },
                { value: "image/webp", label: "WebP Images" },
                { value: "video/mp4", label: "MP4 Videos" },
                { value: "video/webm", label: "WebM Videos" },
                { value: "application/pdf", label: "PDF Documents" }
              ].map(type => (
                <label key={type.value} className="file-type-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.allowedFileTypes.includes(type.value)}
                    onChange={() => handleFileTypeToggle(type.value)}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 8: Maintenance */}
        <div className="form-section">
          <h3 className="form-section-title">Maintenance Mode</h3>
          
          <label className="maintenance-toggle">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={handleInputChange}
            />
            <span>Enable Maintenance Mode</span>
          </label>

          {formData.maintenanceMode && (
            <div className="form-group">
              <label htmlFor="maintenanceMessage" className="form-label">
                Maintenance Message
              </label>
              <textarea
                id="maintenanceMessage"
                name="maintenanceMessage"
                value={formData.maintenanceMessage}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="We're currently performing scheduled maintenance..."
              />
            </div>
          )}
        </div>

        {/* Section 9: Social Media & Analytics */}
        <div className="form-section">
          <h3 className="form-section-title">Social Media Links</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="facebookUrl" className="form-label">
                Facebook URL
              </label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label htmlFor="twitterUrl" className="form-label">
                Twitter URL
              </label>
              <input
                type="url"
                id="twitterUrl"
                name="twitterUrl"
                value={formData.twitterUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="instagramUrl" className="form-label">
                Instagram URL
              </label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedinUrl" className="form-label">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>

          <h4 className="subsection-title">Analytics IDs</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="googleAnalyticsId" className="form-label">
                Google Analytics ID
              </label>
              <input
                type="text"
                id="googleAnalyticsId"
                name="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="GA-XXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebookPixelId" className="form-label">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                id="facebookPixelId"
                name="facebookPixelId"
                value={formData.facebookPixelId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="123456789012345"
              />
            </div>
          </div>
        </div>

        {/* Section 10: Legal & Contact */}
        <div className="form-section">
          <h3 className="form-section-title">Legal & Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="termsOfServiceUrl" className="form-label">
                Terms of Service URL
              </label>
              <input
                type="url"
                id="termsOfServiceUrl"
                name="termsOfServiceUrl"
                value={formData.termsOfServiceUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/terms"
              />
            </div>

            <div className="form-group">
              <label htmlFor="privacyPolicyUrl" className="form-label">
                Privacy Policy URL
              </label>
              <input
                type="url"
                id="privacyPolicyUrl"
                name="privacyPolicyUrl"
                value={formData.privacyPolicyUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/privacy"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactEmail" className="form-label">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className={`form-input ${errors.contactEmail ? "error" : ""}`}
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <div className="form-error">{errors.contactEmail}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="supportEmail" className="form-label">
                Support Email
              </label>
              <input
                type="email"
                id="supportEmail"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleInputChange}
                className={`form-input ${errors.supportEmail ? "error" : ""}`}
                placeholder="support@example.com"
              />
              {errors.supportEmail && (
                <div className="form-error">{errors.supportEmail}</div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <span className="loading-text">
                <span className="loading-spinner-small"></span>
                Saving...
              </span>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

