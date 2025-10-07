import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { eventsAPI } from "../../utils/api";
import "./EventDetail.css";
import AlbumManager from "../../components/AlbumManager/AlbumManager";
import MemoryViewer from "../../components/MemoryViewer/MemoryViewer";
import RatingReview from "../../components/RatingReview/RatingReview";
import EventChat from "../../components/EventChat/EventChat";
import EventPoll from "../../components/EventPoll/EventPoll";
import EventWaitlist from "../../components/EventWaitlist/EventWaitlist";
import EventShare from "../../components/EventShare/EventShare";
import { useAuth } from "../../context/AuthContext";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    specialRequests: "",
    emergencyContact: "",
    dietaryRestrictions: "",
  });
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // New state for enhanced features
  const [activeTab, setActiveTab] = useState("details");
  const [showChat, setShowChat] = useState(false);

  // Fetch event details
  const fetchEventDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await eventsAPI.getById(id);
      setEvent(response.data.event);
    } catch (error) {
      console.error("Error fetching event detail:", error);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);

  // Handle event registration
  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    try {
      setRegistering(true);
      await eventsAPI.register(id);
      await fetchEventDetail(); // Refresh event data
      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for event");
    } finally {
      setRegistering(false);
    }
  }, [id, fetchEventDetail]);

  // Handle event unregistration
  const handleUnregister = useCallback(async () => {
    try {
      await eventsAPI.unregister(id);
      await fetchEventDetail(); // Refresh event data
    } catch (error) {
      console.error("Error unregistering from event:", error);
      alert("Failed to unregister from event");
    }
  }, [id, fetchEventDetail]);

  // Handle registration form input changes
  const handleRegistrationInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Format date and time
  const formatEventDateTime = useCallback((date, time) => {
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${formattedDate} at ${time}`;
  }, []);

  // Check if user is registered
  const isUserRegistered = useMemo(() => {
    return event?.registeredUsers?.includes(user?.id) || false;
  }, [event?.registeredUsers, user?.id]);

  // Check if user is the organizer
  const isUserOrganizer = useMemo(() => {
    return event?.organizer?.id === user?.id || false;
  }, [event?.organizer?.id, user?.id]);

  // Check if event has ended
  const hasEventEnded = useMemo(() => {
    if (!event?.date) return false;
    return new Date(event.date) < new Date();
  }, [event?.date]);

  // Check if user can review (registered and event has ended)
  const canUserReview = useMemo(() => {
    return isUserRegistered && hasEventEnded;
  }, [isUserRegistered, hasEventEnded]);

  // Check if user can create polls (organizer)
  const canCreatePolls = useMemo(() => {
    return isUserOrganizer;
  }, [isUserOrganizer]);

  if (loading) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <div className="error-container">
          <h2>Event Not Found</h2>
          <p>{error || "The event you're looking for doesn't exist."}</p>
          <button onClick={() => navigate("/home")} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <Navbar />
      
      <div className="event-detail-container">
        {/* Event Header */}
        <div className="event-header">
          <div className="event-image-section">
            {event.thumbnail?.url || event.eventImage ? (
              <img
                src={event.thumbnail?.url || event.eventImage}
                alt={event.title}
                className="event-image"
              />
            ) : (
              <div className="event-image-placeholder">
                <span className="placeholder-icon">📅</span>
              </div>
            )}
          </div>
          
          <div className="event-info">
            <div className="event-meta">
              <span className="event-category">{event.category?.name || event.category}</span>
              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  {event.tags.map(tag => (
                    <span key={tag.id || tag} className="event-tag">
                      #{tag.name || tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>
            
            <div className="event-details">
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span className="detail-text">{formatEventDateTime(event.date, event.time)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span className="detail-text">{event.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👤</span>
                <span className="detail-text">Hosted by {event.organizer?.name || "Unknown"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👥</span>
                <span className="detail-text">
                  {event.registrationCount} / {event.maxAttendees} attendees
                </span>
              </div>
            </div>

            {/* Event Actions */}
            <div className="event-actions">
              {!isUserRegistered ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowRegistrationForm(true)}
                  disabled={event.registrationCount >= event.maxAttendees}
                >
                  {event.registrationCount >= event.maxAttendees ? "Event Full" : "Register"}
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={handleUnregister}
                >
                  Unregister
                </button>
              )}
              
              {event.shareable && (
                <EventShare event={event} />
              )}
              
              {event.allowChat && isUserRegistered && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowChat(true)}
                >
                  💬 Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Event Tabs */}
        <div className="event-tabs">
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            📋 Details
          </button>
          {event.allowReviews && (
            <button
              className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              ⭐ Reviews
            </button>
          )}
          {event.allowPolls && (
            <button
              className={`tab-button ${activeTab === "polls" ? "active" : ""}`}
              onClick={() => setActiveTab("polls")}
            >
              📊 Polls
            </button>
          )}
          <button
            className={`tab-button ${activeTab === "memories" ? "active" : ""}`}
            onClick={() => setActiveTab("memories")}
          >
            📸 Memories
          </button>
        </div>

        {/* Tab Content */}
        <div className="event-content">
          {activeTab === "details" && (
            <div className="tab-content">
              {/* Waitlist */}
              {event.allowWaitlist && (
                <EventWaitlist 
                  event={event} 
                  onRegistrationChange={fetchEventDetail}
                />
              )}

              {/* Additional Event Information */}
              <div className="event-additional-info">
                <h3>Event Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Category:</strong> {event.category?.name || event.category}
                  </div>
                  <div className="info-item">
                    <strong>Maximum Attendees:</strong> {event.maxAttendees}
                  </div>
                  <div className="info-item">
                    <strong>Current Registrations:</strong> {event.registrationCount}
                  </div>
                  {event.isRecurring && (
                    <div className="info-item">
                      <strong>Recurring:</strong> {event.recurringPattern}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && event.allowReviews && (
            <div className="tab-content">
              <RatingReview 
                eventId={event.id} 
                canReview={canUserReview}
              />
            </div>
          )}

          {activeTab === "polls" && event.allowPolls && (
            <div className="tab-content">
              <EventPoll 
                eventId={event.id} 
                canCreatePoll={canCreatePolls}
              />
            </div>
          )}

          {activeTab === "memories" && (
            <div className="tab-content">
              <AlbumManager 
                eventId={event.id}
                onAlbumSelect={setSelectedAlbum}
              />
              {selectedAlbum && (
                <MemoryViewer 
                  album={selectedAlbum}
                  onBack={() => setSelectedAlbum(null)}
                  isRegistered={event.registeredUsers?.some(user => user.id === user?.id) || false}
                />
              )}
            </div>
          )}
        </div>

        {/* Registration Modal */}
        {showRegistrationForm && (
          <div className="modal-overlay" onClick={() => setShowRegistrationForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Register for Event</h3>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="specialRequests" className="form-label">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={registrationData.specialRequests}
                    onChange={handleRegistrationInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Any special requests or accommodations needed..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact" className="form-label">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={registrationData.emergencyContact}
                    onChange={handleRegistrationInputChange}
                    className="form-input"
                    placeholder="Emergency contact name and phone"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dietaryRestrictions" className="form-label">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    id="dietaryRestrictions"
                    name="dietaryRestrictions"
                    value={registrationData.dietaryRestrictions}
                    onChange={handleRegistrationInputChange}
                    className="form-input"
                    placeholder="Any dietary restrictions or allergies..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="btn btn-primary"
                  >
                    {registering ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && (
          <EventChat
            eventId={event.id}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetail;