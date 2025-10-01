//frontend/src/pages/Home/Home.js
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import "./Home.css"

const Home = () => {
  const { user } = useAuth()
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/events/user/registered")
      setMyEvents(response.data.events)
    } catch (error) {
      console.error("Error fetching my events:", error)
      setError("Failed to load your events")
    } finally {
      setLoading(false)
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

  const isEventUpcoming = (dateString) => {
    return new Date(dateString) > new Date()
  }

  const upcomingEvents = myEvents.filter((event) => isEventUpcoming(event.date))
  const pastEvents = myEvents.filter((event) => !isEventUpcoming(event.date))

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-container">
        <div className="home-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your events and discover new experiences</p>
        </div>

        <div className="home-content">
          <div className="my-events-section">
            <div className="section-header">
              <h2>My Events</h2>
              <Link to="/upcoming-events" className="btn btn-secondary">
                Discover More Events
              </Link>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your events...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchMyEvents} className="btn btn-secondary">
                  Try Again
                </button>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="empty-state">
                <h3>No Events Yet</h3>
                <p>You haven't registered for any events yet. Start exploring!</p>
                <Link to="/upcoming-events" className="btn btn-primary">
                  Browse Events
                </Link>
              </div>
            ) : (
              <>
                {upcomingEvents.length > 0 && (
                  <div className="events-subsection">
                    <h3>Upcoming Events ({upcomingEvents.length})</h3>
                    <div className="events-grid">
                      {upcomingEvents.map((event) => (
                        <Link to={`/event/${event.id}`} key={event.id} className="event-card">
                          <div className="event-card-header">
                            {event.eventImage && (
                              <img
                                src={event.eventImage || "/placeholder.svg"}
                                alt={event.title}
                                className="event-image"
                              />
                            )}
                            <div className="event-category">{event.category}</div>
                          </div>
                          <div className="event-card-content">
                            <h4>{event.title}</h4>
                            <p className="event-description">{event.description}</p>
                            <div className="event-details">
                              <div className="event-date">
                                <strong>📅 {formatDate(event.date)}</strong>
                              </div>
                              <div className="event-time">🕒 {formatTime(event.time)}</div>
                              <div className="event-location">📍 {event.location}</div>
                              <div className="event-host">👤 Hosted by {event.hostName}</div>
                            </div>
                            <div className="event-stats">
                              <span>{event.registrationCount} registered</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div className="events-subsection">
                    <h3>Past Events ({pastEvents.length})</h3>
                    <div className="events-grid">
                      {pastEvents.map((event) => (
                        <Link to={`/event/${event.id}`} key={event.id} className="event-card past-event">
                          <div className="event-card-header">
                            {event.eventImage && (
                              <img
                                src={event.eventImage || "/placeholder.svg"}
                                alt={event.title}
                                className="event-image"
                              />
                            )}
                            <div className="event-category">{event.category}</div>
                          </div>
                          <div className="event-card-content">
                            <h4>{event.title}</h4>
                            <p className="event-description">{event.description}</p>
                            <div className="event-details">
                              <div className="event-date">
                                <strong>📅 {formatDate(event.date)}</strong>
                              </div>
                              <div className="event-time">🕒 {formatTime(event.time)}</div>
                              <div className="event-location">📍 {event.location}</div>
                              <div className="event-host">👤 Hosted by {event.hostName}</div>
                            </div>
                            <div className="event-stats">
                              <span>{event.registrationCount} attended</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/create-event" className="action-card">
                <div className="action-icon">➕</div>
                <h4>Create Event</h4>
                <p>Host your own event and bring people together</p>
              </Link>
              <Link to="/upcoming-events" className="action-card">
                <div className="action-icon">🔍</div>
                <h4>Discover Events</h4>
                <p>Find exciting events happening near you</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
