"use client"

import { useState, useEffect, useCallback, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import axios from "axios"
import "./EventDetail.css"
import AlbumManager from "../../components/AlbumManager/AlbumManager"
import MemoryViewer from "../../components/MemoryViewer/MemoryViewer"
import { useAuth } from "../../context/AuthContext"

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [registering, setRegistering] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    specialRequests: "",
    emergencyContact: "",
    dietaryRestrictions: "",
  })
  const [selectedAlbum, setSelectedAlbum] = useState(null)

  const fetchEventDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setEvent(response.data.event)
    } catch (error) {
      console.error("Error fetching event detail:", error)
      setError("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    fetchEventDetail()
  }, [fetchEventDetail])

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      setRegistering(true)
      await axios.post(
        `/api/events/${id}/register`,
        registrationData, // will be ignored by backend unless you add support
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      setEvent((prev) => ({
        ...prev,
        isRegistered: true,
        registrationCount: prev.registrationCount + 1,
      }))

      setShowRegistrationForm(false)
      alert("Successfully registered for event!")
    } catch (error) {
      console.error("Registration error:", error)
      alert(error.response?.data?.message || "Failed to register for event")
    } finally {
      setRegistering(false)
    }
  }

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to unregister from this event?")) {
      return
    }

    try {
      setRegistering(true)
      await axios.delete(`/api/events/${id}/unregister`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      setEvent((prev) => ({
        ...prev,
        isRegistered: false,
        registrationCount: prev.registrationCount > 0 ? prev.registrationCount - 1 : 0,
      }))

      alert("Successfully unregistered from event!")
    } catch (error) {
      console.error("Unregistration error:", error)
      alert(error.response?.data?.message || "Failed to unregister from event")
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return timeString
  }

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
  }

  if (loading) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <div className="error-container">
          <p className="error-message">{error || "Event not found"}</p>
          <button onClick={() => navigate("/upcoming-events")} className="btn btn-secondary">
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  // Get image URL (backend may send eventImage or thumbnail.url)
  const eventImageUrl =
    event.eventImage && typeof event.eventImage === "string"
      ? event.eventImage
      : event.thumbnail && event.thumbnail.url
      ? event.thumbnail.url
      : "/placeholder.svg"

  return (
    <div className="event-detail-page">
      <Navbar />

      <div className="event-detail-container">
        <div className="event-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>

          <div className="event-hero">
            {eventImageUrl ? (
              <img src={eventImageUrl} alt={event.title} className="event-hero-image" />
            ) : (
              <div className="event-hero-placeholder">📅</div>
            )}

            <div className="event-hero-content">
              <div className="event-category-badge">{event.category}</div>
              <h1>{event.title}</h1>
              <p className="event-description">{event.description}</p>

              <div className="event-meta">
                <div className="event-meta-item">
                  <strong>📅 Date:</strong> {formatDate(event.date)}
                </div>
                <div className="event-meta-item">
                  <strong>🕒 Time:</strong> {formatTime(event.time)}
                </div>
                <div className="event-meta-item">
                  <strong>📍 Location:</strong> {event.location}
                </div>
                <div className="event-meta-item">
                  <strong>👤 Host:</strong> {event.hostName}
                </div>
                <div className="event-meta-item">
                  <strong>👥 Registered:</strong> {event.registrationCount} / {event.maxAttendees}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="event-actions">
          {event.isRegistered ? (
            <button onClick={handleUnregister} disabled={registering} className="btn btn-danger">
              {registering ? "Unregistering..." : "Unregister"}
            </button>
          ) : (
            <button
              onClick={() => setShowRegistrationForm(true)}
              disabled={registering || event.registrationCount >= event.maxAttendees}
              className="btn btn-primary"
            >
              {event.registrationCount >= event.maxAttendees ? "Event Full" : "Register for Event"}
            </button>
          )}
        </div>

        {showRegistrationForm && (
          <div className="registration-modal">
            <div className="registration-form-container">
              <h2>Register for {event.title}</h2>

              <form onSubmit={handleRegister} className="registration-form">
                <div className="form-group">
                  <label htmlFor="specialRequests">Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    value={registrationData.specialRequests}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        specialRequests: e.target.value,
                      }))
                    }
                    placeholder="Any special accommodations needed?"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact (Optional)</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    value={registrationData.emergencyContact}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    placeholder="Emergency contact name and phone"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</label>
                  <input
                    type="text"
                    id="dietaryRestrictions"
                    value={registrationData.dietaryRestrictions}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        dietaryRestrictions: e.target.value,
                      }))
                    }
                    placeholder="Any dietary restrictions or allergies"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowRegistrationForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={registering} className="btn btn-primary">
                    {registering ? "Registering..." : "Confirm Registration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="event-content">
          <div className="event-section">
            <h2>Event Details</h2>
            <div className="event-details-grid">
              <div className="detail-item">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>

              <div className="detail-item">
                <h3>Event Statistics</h3>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-number">{event.registrationCount}</span>
                    <span className="stat-label">Registered</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{event.likesCount ?? 0}</span>
                    <span className="stat-label">Likes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{event.albums?.length || 0}</span>
                    <span className="stat-label">Albums</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedAlbum ? (
            <MemoryViewer album={selectedAlbum} onBack={handleBackToAlbums} isRegistered={event.isRegistered} />
          ) : (
            <AlbumManager eventId={event.id} isRegistered={event.isRegistered} onAlbumSelect={handleAlbumSelect} />
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetail
