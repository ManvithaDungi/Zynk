import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { usersAPI } from "../../utils/api";
import "./UserProfile.css";

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    birthdate: "",
    gender: "",
    country: "",
    city: "",
    website: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      linkedin: "",
      github: ""
    },
    avatar: null,
    coverImage: null,
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    theme: "light",
    language: "en",
    timezone: "UTC",
    accountType: "free",
    interests: []
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Interest options
  const interestOptions = [
    "Technology", "Sports", "Music", "Art", "Travel", 
    "Food", "Photography", "Gaming", "Reading", "Fitness"
  ];

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await usersAPI.getProfile(user.id);
        const profileData = response.data.user;
        
        setFormData(prev => ({
          ...prev,
          name: profileData.name || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          phone: profileData.phone || "",
          birthdate: profileData.birthdate || "",
          gender: profileData.gender || "",
          country: profileData.country || "",
          city: profileData.city || "",
          website: profileData.website || "",
          socialLinks: profileData.socialLinks || prev.socialLinks,
          emailNotifications: profileData.emailNotifications ?? true,
          pushNotifications: profileData.pushNotifications ?? false,
          marketingEmails: profileData.marketingEmails ?? false,
          profileVisibility: profileData.profileVisibility || "public",
          showEmail: profileData.showEmail ?? false,
          showPhone: profileData.showPhone ?? false,
          allowMessages: profileData.allowMessages ?? true,
          theme: profileData.theme || "light",
          language: profileData.language || "en",
          timezone: profileData.timezone || "UTC",
          accountType: profileData.accountType || "free",
          interests: profileData.interests || []
        }));

        if (profileData.avatar) {
          setAvatarPreview(profileData.avatar);
        }
        if (profileData.coverImage) {
          setCoverPreview(profileData.coverImage);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrors({ fetch: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Handle interest toggle
  const handleInterestToggle = useCallback((interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: "File size must be less than 5MB" 
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
      if (type === "avatar") {
        setAvatarPreview(reader.result);
      } else {
        setCoverPreview(reader.result);
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

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
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
        if (key === "avatar" && formData[key]) {
          submitData.append("avatar", formData[key]);
        } else if (key === "coverImage" && formData[key]) {
          submitData.append("coverImage", formData[key]);
        } else if (key === "socialLinks") {
          submitData.append("socialLinks", JSON.stringify(formData[key]));
        } else if (key === "interests") {
          submitData.append("interests", JSON.stringify(formData[key]));
        } else if (key !== "avatar" && key !== "coverImage") {
          submitData.append(key, formData[key]);
        }
      });

      await usersAPI.updateProfile(user.id, submitData);
      
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, validateForm]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  }, []);

  if (loading) {
    return (
      <div className="user-profile-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <Navbar />

      <div className="user-profile-container">
        <header className="page-header">
          <h1>Edit Profile</h1>
          <p>Manage your personal information and preferences</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
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

          {/* Section 1: Cover & Avatar Images */}
          <div className="form-section">
            <h2 className="form-section-title">Profile Images</h2>
            
            <div className="image-upload-grid">
              {/* Cover Image */}
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div className="cover-image-preview">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" />
                  ) : (
                    <div className="image-placeholder">
                      <span>📷</span>
                      <p>No cover image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "coverImage")}
                  className="file-input"
                />
                {errors.coverImage && (
                  <div className="form-error">{errors.coverImage}</div>
                )}
              </div>

              {/* Avatar */}
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>👤</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "avatar")}
                  className="file-input"
                />
                {errors.avatar && (
                  <div className="form-error">{errors.avatar}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Basic Information */}
          <div className="form-section">
            <h2 className="form-section-title">Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter your full name"
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
                  placeholder="your.email@example.com"
                  required
                />
                {errors.email && (
                  <div className="form-error">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={`form-textarea ${errors.bio ? "error" : ""}`}
                placeholder="Tell us about yourself..."
                rows="4"
                maxLength="500"
              />
              <div className="character-count">
                {formData.bio.length}/500
              </div>
              {errors.bio && (
                <div className="form-error">{errors.bio}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
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
                <label htmlFor="birthdate" className="form-label">
                  Birth Date
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="accountType" className="form-label">
                  Account Type
                </label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="form-section">
            <h2 className="form-section-title">Location</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="United States"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="New York"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Links */}
          <div className="form-section">
            <h2 className="form-section-title">Social Links & Website</h2>
            
            <div className="form-group">
              <label htmlFor="website" className="form-label">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`form-input ${errors.website ? "error" : ""}`}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <div className="form-error">{errors.website}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="twitter" className="form-label">
                  Twitter
                </label>
                <input
                  type="text"
                  id="twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="@username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="instagram" className="form-label">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="linkedin" className="form-label">
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="linkedin"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="github" className="form-label">
                  GitHub
                </label>
                <input
                  type="text"
                  id="github"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="github.com/username"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Interests */}
          <div className="form-section">
            <h2 className="form-section-title">Interests</h2>
            <p className="form-help">Select your areas of interest</p>
            
            <div className="interests-grid">
              {interestOptions.map(interest => (
                <label key={interest} className="interest-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 6: Privacy Settings */}
          <div className="form-section">
            <h2 className="form-section-title">Privacy Settings</h2>
            
            <div className="form-group">
              <label className="form-label">Profile Visibility</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="public"
                    checked={formData.profileVisibility === "public"}
                    onChange={handleInputChange}
                  />
                  <span>Public - Anyone can see your profile</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="friends"
                    checked={formData.profileVisibility === "friends"}
                    onChange={handleInputChange}
                  />
                  <span>Friends Only - Only your friends can see</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="private"
                    checked={formData.profileVisibility === "private"}
                    onChange={handleInputChange}
                  />
                  <span>Private - Only you can see</span>
                </label>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleInputChange}
                />
                <span>Show email on profile</span>
              </label>

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={formData.showPhone}
                  onChange={handleInputChange}
                />
                <span>Show phone number on profile</span>
              </label>

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="allowMessages"
                  checked={formData.allowMessages}
                  onChange={handleInputChange}
                />
                <span>Allow others to send me messages</span>
              </label>
            </div>
          </div>

          {/* Section 7: Notifications */}
          <div className="form-section">
            <h2 className="form-section-title">Notification Preferences</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                />
                <span>Email Notifications</span>
              </label>

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={formData.pushNotifications}
                  onChange={handleInputChange}
                />
                <span>Push Notifications</span>
              </label>

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={formData.marketingEmails}
                  onChange={handleInputChange}
                />
                <span>Marketing and promotional emails</span>
              </label>
            </div>
          </div>

          {/* Section 8: Preferences */}
          <div className="form-section">
            <h2 className="form-section-title">App Preferences</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="theme" className="form-label">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language" className="form-label">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timezone" className="form-label">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="America/Denver">Mountain Time (US)</option>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
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
              Reset Changes
            </button>
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
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;

