"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import axios from "axios"
import "./UpcomingEvents.css"

const UpcomingEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState("gallery") // 'gallery' or 'timeline'

  const categories = ["All", "Conference", "Workshop", "Meetup", "Social", "Sports", "Arts", "Music", "Other"]

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/events/upcoming")
      setEvents(response.data.events)
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
      setError("Failed to load upcoming events")
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const groupEventsByDate = (events) => {
    const grouped = {}
    events.forEach((event) => {
      const dateKey = new Date(event.date).toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }

  const groupedEvents = groupEventsByDate(filteredEvents)

  return (
    <div className="upcoming-events-page">
      <Navbar />

      <div className="upcoming-events-container">
        <div className="page-header">
          <h1>Upcoming Events</h1>
          <p>Discover amazing events happening in your community</p>
        </div>

        <div className="events-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <div className="category-filters">
              <label htmlFor="category-select" className="filter-label">
                Category:
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "gallery" ? "active" : ""}`}
                onClick={() => setViewMode("gallery")}
              >
                Gallery
              </button>
              <button
                className={`view-btn ${viewMode === "timeline" ? "active" : ""}`}
                onClick={() => setViewMode("timeline")}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        <div className="events-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchUpcomingEvents} className="btn btn-secondary">
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <h3>No Events Found</h3>
              <p>
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search or filters"
                  : "No upcoming events available at the moment"}
              </p>
              <Link to="/create-event" className="btn btn-primary">
                Create an Event
              </Link>
            </div>
          ) : viewMode === "gallery" ? (
            <div className="events-gallery">
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <Link to={`/event/${event.id}`} key={event.id} className="event-card">
                    <div className="event-card-header">
                      {event.eventImage ? (
                        <img src={event.eventImage || "/placeholder.svg"} alt={event.title} className="event-image" />
                      ) : (
                        <div className="event-placeholder">📅</div>
                      )}
                      <div className="event-category">{event.category}</div>
                    </div>
                    <div className="event-card-content">
                      <h3>{event.title}</h3>
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
                        <span>{event.likesCount} likes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="events-timeline">
              {Object.entries(groupedEvents)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .map(([dateKey, dayEvents]) => (
                  <div key={dateKey} className="timeline-day">
                    <div className="timeline-date">
                      <h3>{formatDate(dateKey)}</h3>
                      <div className="timeline-line"></div>
                    </div>
                    <div className="timeline-events">
                      {dayEvents.map((event) => (
                        <Link to={`/event/${event.id}`} key={event.id} className="timeline-event-card">
                          <div className="timeline-event-time">{formatTime(event.time)}</div>
                          <div className="timeline-event-content">
                            <h4>{event.title}</h4>
                            <p className="timeline-event-location">📍 {event.location}</p>
                            <p className="timeline-event-host">👤 {event.hostName}</p>
                            <div className="timeline-event-category">{event.category}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpcomingEvents
