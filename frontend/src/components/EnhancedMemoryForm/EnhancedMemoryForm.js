import React, { useState, useCallback, useRef } from "react";
import { postsAPI } from "../../utils/api";
import "./EnhancedMemoryForm.css";

const EnhancedMemoryForm = ({ albumId, onClose, onSuccess }) => {
  // Basic memory data
  const [formData, setFormData] = useState({
    caption: "",
    description: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    mood: "happy",
    weather: "sunny",
    tags: [],
    category: "",
    priority: "medium",
    visibility: "public",
    allowComments: true,
    allowDownload: true,
    allowSharing: true,
    isPrivate: false,
    reminderDate: "",
    reminderTime: "",
    customFields: {},
    rating: 5,
    color: "#000000",
    fontSize: 16,
    fontFamily: "Arial",
    textAlign: "left",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    margin: 5,
    opacity: 1,
    transform: "scale(1)",
    filter: "none",
    transition: "all 0.3s ease"
  });

  // Media handling
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [captureMode, setCaptureMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Form states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Available options
  const moodOptions = [
    { value: "happy", label: "😊 Happy", color: "#FFD700" },
    { value: "sad", label: "😢 Sad", color: "#4169E1" },
    { value: "excited", label: "🤩 Excited", color: "#FF6347" },
    { value: "calm", label: "😌 Calm", color: "#98FB98" },
    { value: "angry", label: "😠 Angry", color: "#DC143C" },
    { value: "surprised", label: "😲 Surprised", color: "#FFA500" },
    { value: "love", label: "😍 Love", color: "#FF69B4" },
    { value: "grateful", label: "🙏 Grateful", color: "#9370DB" }
  ];

  const weatherOptions = [
    { value: "sunny", label: "☀️ Sunny" },
    { value: "cloudy", label: "☁️ Cloudy" },
    { value: "rainy", label: "🌧️ Rainy" },
    { value: "snowy", label: "❄️ Snowy" },
    { value: "windy", label: "💨 Windy" },
    { value: "stormy", label: "⛈️ Stormy" },
    { value: "foggy", label: "🌫️ Foggy" },
    { value: "clear", label: "🌙 Clear Night" }
  ];

  const categoryOptions = [
    "Personal", "Travel", "Food", "Nature", "Family", "Friends", 
    "Work", "Hobby", "Event", "Achievement", "Learning", "Health",
    "Entertainment", "Sports", "Art", "Music", "Other"
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority", color: "#28a745" },
    { value: "medium", label: "Medium Priority", color: "#ffc107" },
    { value: "high", label: "High Priority", color: "#dc3545" },
    { value: "urgent", label: "Urgent", color: "#6f42c1" }
  ];

  const visibilityOptions = [
    { value: "public", label: "Public", icon: "🌍" },
    { value: "friends", label: "Friends Only", icon: "👥" },
    { value: "private", label: "Private", icon: "🔒" },
    { value: "group", label: "Group", icon: "👨‍👩‍👧‍👦" }
  ];

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.caption.trim()) {
      newErrors.caption = "Caption is required";
    }
    
    if (mediaFiles.length === 0 && mediaPreviews.length === 0) {
      newErrors.media = "At least one media file is required";
    }
    
    if (formData.reminderDate && !formData.reminderTime) {
      newErrors.reminderTime = "Reminder time is required when date is set";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mediaFiles, mediaPreviews]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle tag input
  const handleTagInput = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        e.target.value = '';
      }
    }
  }, [formData.tags]);

  // Remove tag
  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, {
          url: e.target.result,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Remove media
  const removeMedia = useCallback((index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Camera functions
  const startCapture = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      setCaptureMode(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera");
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCaptureMode(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setMediaFiles(prev => [...prev, file]);
        setMediaPreviews(prev => [...prev, {
          url: canvas.toDataURL(),
          type: 'image',
          name: file.name,
          size: file.size
        }]);
      }, 'image/jpeg', 0.8);
    }
  }, []);

  // Video recording functions
  const startRecording = useCallback(() => {
    if (stream) {
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `video-recording-${Date.now()}.webm`, { type: 'video/webm' });
        setMediaFiles(prev => [...prev, file]);
        setMediaPreviews(prev => [...prev, {
          url: URL.createObjectURL(blob),
          type: 'video',
          name: file.name,
          size: file.size
        }]);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, recording]);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formData.tags.forEach(tag => submitData.append('tags[]', tag));
        } else if (key === 'customFields') {
          Object.keys(formData.customFields).forEach(field => {
            submitData.append(`customFields.${field}`, formData.customFields[field]);
          });
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add media files
      mediaFiles.forEach((file, index) => {
        submitData.append('media', file);
      });
      
      // Add album ID
      submitData.append('albumId', albumId);
      
      const response = await postsAPI.create(submitData);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Reset form
      setFormData({
        caption: "",
        description: "",
        location: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        mood: "happy",
        weather: "sunny",
        tags: [],
        category: "",
        priority: "medium",
        visibility: "public",
        allowComments: true,
        allowDownload: true,
        allowSharing: true,
        isPrivate: false,
        reminderDate: "",
        reminderTime: "",
        customFields: {},
        rating: 5,
        color: "#000000",
        fontSize: 16,
        fontFamily: "Arial",
        textAlign: "left",
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        margin: 5,
        opacity: 1,
        transform: "scale(1)",
        filter: "none",
        transition: "all 0.3s ease"
      });
      
      setMediaFiles([]);
      setMediaPreviews([]);
      setCurrentStep(1);
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error creating memory:", error);
      setErrors({ submit: error.response?.data?.message || "Failed to create memory" });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mediaFiles, validateForm, albumId, onSuccess, onClose]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="caption">Caption *</label>
              <input
                type="text"
                id="caption"
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                placeholder="What's this memory about?"
                maxLength="200"
                required
              />
              {errors.caption && <span className="error">{errors.caption}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us more about this memory..."
                rows="4"
                maxLength="1000"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Where was this taken?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mood">Mood</label>
                <select
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                >
                  {moodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="weather">Weather</label>
                <select
                  id="weather"
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                >
                  {weatherOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>Media & Content</h3>
            
            <div className="form-group">
              <label>Media Files *</label>
              <div className="media-upload-section">
                <div className="upload-buttons">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    📁 Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    🎵 Upload Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    📄 Upload Documents
                  </button>
                  {!captureMode ? (
                    <button
                      type="button"
                      onClick={startCapture}
                      className="btn btn-secondary"
                    >
                      📷 Use Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCapture}
                      className="btn btn-secondary"
                    >
                      📷 Stop Camera
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <input
                  ref={audioInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {captureMode && (
                  <div className="camera-section">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="camera-preview"
                    />
                    <div className="camera-controls">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="btn btn-primary"
                      >
                        📸 Capture Photo
                      </button>
                      {!recording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="btn btn-primary"
                        >
                          🎥 Start Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="btn btn-danger"
                        >
                          ⏹️ Stop Recording
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {mediaPreviews.length > 0 && (
                  <div className="media-previews">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="media-preview-item">
                        {preview.type === 'video' ? (
                          <video src={preview.url} controls />
                        ) : (
                          <img src={preview.url} alt={`Preview ${index + 1}`} />
                        )}
                        <div className="media-info">
                          <span>{preview.name}</span>
                          <span>{(preview.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="remove-media-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.media && <span className="error">{errors.media}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                placeholder="Type tags and press Enter or comma to add"
                onKeyDown={handleTagInput}
              />
              {formData.tags.length > 0 && (
                <div className="tags-container">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="remove-tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>Settings & Privacy</h3>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-group">
                {visibilityOptions.map(option => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={handleChange}
                    />
                    <span className="radio-custom">
                      {option.icon} {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Permissions</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Allow Comments
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowDownload"
                    checked={formData.allowDownload}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Allow Download
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowSharing"
                    checked={formData.allowSharing}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Allow Sharing
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reminderDate">Reminder Date</label>
                <input
                  type="date"
                  id="reminderDate"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reminderTime">Reminder Time</label>
                <input
                  type="time"
                  id="reminderTime"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <input
                type="range"
                id="rating"
                name="rating"
                min="1"
                max="10"
                value={formData.rating}
                onChange={handleChange}
                className="range-slider"
              />
              <div className="range-labels">
                <span>1 (Poor)</span>
                <span className="current-value">{formData.rating}</span>
                <span>10 (Excellent)</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>Customization & Styling</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="color">Text Color</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="backgroundColor">Background Color</label>
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fontSize">Font Size</label>
                <input
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  min="8"
                  max="72"
                  value={formData.fontSize}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="fontFamily">Font Family</label>
                <select
                  id="fontFamily"
                  name="fontFamily"
                  value={formData.fontFamily}
                  onChange={handleChange}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="textAlign">Text Alignment</label>
              <select
                id="textAlign"
                name="textAlign"
                value={formData.textAlign}
                onChange={handleChange}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="borderColor">Border Color</label>
                <input
                  type="color"
                  id="borderColor"
                  name="borderColor"
                  value={formData.borderColor}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="borderWidth">Border Width</label>
                <input
                  type="range"
                  id="borderWidth"
                  name="borderWidth"
                  min="0"
                  max="10"
                  value={formData.borderWidth}
                  onChange={handleChange}
                  className="range-slider"
                />
                <span className="range-value">{formData.borderWidth}px</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="borderRadius">Border Radius</label>
                <input
                  type="range"
                  id="borderRadius"
                  name="borderRadius"
                  min="0"
                  max="50"
                  value={formData.borderRadius}
                  onChange={handleChange}
                  className="range-slider"
                />
                <span className="range-value">{formData.borderRadius}px</span>
              </div>
              <div className="form-group">
                <label htmlFor="opacity">Opacity</label>
                <input
                  type="range"
                  id="opacity"
                  name="opacity"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.opacity}
                  onChange={handleChange}
                  className="range-slider"
                />
                <span className="range-value">{Math.round(formData.opacity * 100)}%</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="filter">Filter Effect</label>
              <select
                id="filter"
                name="filter"
                value={formData.filter}
                onChange={handleChange}
              >
                <option value="none">None</option>
                <option value="blur(2px)">Blur</option>
                <option value="brightness(1.2)">Brightness</option>
                <option value="contrast(1.2)">Contrast</option>
                <option value="grayscale(100%)">Grayscale</option>
                <option value="sepia(100%)">Sepia</option>
                <option value="hue-rotate(90deg)">Hue Rotate</option>
                <option value="saturate(1.5)">Saturate</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>Preview & Submit</h3>
            
            <div className="preview-section">
              <h4>Memory Preview</h4>
              <div 
                className="memory-preview"
                style={{
                  color: formData.color,
                  backgroundColor: formData.backgroundColor,
                  fontSize: `${formData.fontSize}px`,
                  fontFamily: formData.fontFamily,
                  textAlign: formData.textAlign,
                  borderColor: formData.borderColor,
                  borderWidth: `${formData.borderWidth}px`,
                  borderStyle: 'solid',
                  borderRadius: `${formData.borderRadius}px`,
                  padding: `${formData.padding}px`,
                  margin: `${formData.margin}px`,
                  opacity: formData.opacity,
                  transform: formData.transform,
                  filter: formData.filter,
                  transition: formData.transition
                }}
              >
                <h3>{formData.caption || "Memory Caption"}</h3>
                <p>{formData.description || "Memory description will appear here..."}</p>
                <div className="preview-meta">
                  <span>📅 {formData.date}</span>
                  <span>🕐 {formData.time}</span>
                  {formData.location && <span>📍 {formData.location}</span>}
                  <span>{moodOptions.find(m => m.value === formData.mood)?.label}</span>
                  <span>{weatherOptions.find(w => w.value === formData.weather)?.label}</span>
                </div>
                {formData.tags.length > 0 && (
                  <div className="preview-tags">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="preview-rating">
                  {'⭐'.repeat(formData.rating)}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn btn-secondary"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Memory...
                  </>
                ) : (
                  'Create Memory'
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="enhanced-memory-form">
      <div className="form-header">
        <h2>Create New Memory</h2>
        <button
          type="button"
          onClick={onClose}
          className="close-btn"
        >
          ×
        </button>
      </div>

      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="memory-form">
        {renderStepContent()}
        
        {currentStep < 5 && (
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn btn-secondary"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn btn-primary"
            >
              Next →
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedMemoryForm;
