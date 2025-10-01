"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import "./CRUDForms.css"

const CRUDForms = () => {
  const [activeTab, setActiveTab] = useState("events")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Event CRUD state
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState({
    id: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Other",
    maxAttendees: 100,
  })
  const [eventOperation, setEventOperation] = useState("create")

  // User CRUD state
  const [users, setUsers] = useState([])
  const [userForm, setUserForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
  })
  const [userOperation, setUserOperation] = useState("create")

  // Album and Memory management are handled within their dedicated views

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/events/upcoming")
      setEvents(response.data.events)
    } catch (error) {
      setError("Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/users")
      setUsers(response.data.users)
    } catch (error) {
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [])

  // No-op placeholders removed for albums and memories to avoid unused warnings

  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents()
    } else if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab, fetchEvents, fetchUsers])

  // Event CRUD operations

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.time || !eventForm.location.trim()) {
      setError("Title, date, time, and location are required")
      return
    }

    try {
      setLoading(true)
      let response

      if (eventOperation === "create") {
        response = await axios.post("/api/events", eventForm)
        setEvents((prev) => [response.data.event, ...prev])
        setSuccess("Event created successfully!")
      } else if (eventOperation === "update") {
        response = await axios.put(`/api/events/${eventForm.id}`, eventForm)
        setEvents((prev) => prev.map((event) => (event.id === eventForm.id ? response.data.event : event)))
        setSuccess("Event updated successfully!")
      }

      resetEventForm()
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleEventDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return

    try {
      setLoading(true)
      await axios.delete(`/api/events/${eventId}`)
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setSuccess("Event deleted successfully!")
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed")
    } finally {
      setLoading(false)
    }
  }

  const loadEventForEdit = (event) => {
    setEventForm({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0],
      time: event.time,
      location: event.location,
      category: event.category,
      maxAttendees: event.maxAttendees,
    })
    setEventOperation("update")
  }

  const resetEventForm = () => {
    setEventForm({
      id: "",
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "Other",
      maxAttendees: 100,
    })
    setEventOperation("create")
  }

  // User CRUD operations

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setError("Name and email are required")
      return
    }

    if (userOperation === "create" && !userForm.password.trim()) {
      setError("Password is required for new users")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userForm.email)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)
      let response

      if (userOperation === "create") {
        response = await axios.post("/api/auth/register", userForm)
        setUsers((prev) => [response.data.user, ...prev])
        setSuccess("User created successfully!")
      } else if (userOperation === "update") {
        response = await axios.put(`/api/users/${userForm.id}`, {
          name: userForm.name,
          email: userForm.email,
        })
        setUsers((prev) => prev.map((user) => (user.id === userForm.id ? response.data.user : user)))
        setSuccess("User updated successfully!")
      }

      resetUserForm()
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleUserDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      setLoading(true)
      await axios.delete(`/api/users/${userId}`)
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      setSuccess("User deleted successfully!")
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed")
    } finally {
      setLoading(false)
    }
  }

  const loadUserForEdit = (user) => {
    setUserForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
    })
    setUserOperation("update")
  }

  const resetUserForm = () => {
    setUserForm({
      id: "",
      name: "",
      email: "",
      password: "",
    })
    setUserOperation("create")
  }

  // Album CRUD operations

  // Memory CRUD operations

  const renderEventForm = () => (
    <div className="crud-section">
      <h3>{eventOperation === "create" ? "Create Event" : "Update Event"}</h3>

      <form onSubmit={handleEventSubmit} className="crud-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventTitle">Title *</label>
            <input
              type="text"
              id="eventTitle"
              value={eventForm.title}
              onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventCategory">Category</label>
            <select
              id="eventCategory"
              value={eventForm.category}
              onChange={(e) => setEventForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Meetup">Meetup</option>
              <option value="Social">Social</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
              <option value="Music">Music</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="eventDescription">Description</label>
          <textarea
            id="eventDescription"
            value={eventForm.description}
            onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your event"
            rows="4"
            maxLength="1000"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventDate">Date *</label>
            <input
              type="date"
              id="eventDate"
              value={eventForm.date}
              onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventTime">Time *</label>
            <input
              type="time"
              id="eventTime"
              value={eventForm.time}
              onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventLocation">Location *</label>
            <input
              type="text"
              id="eventLocation"
              value={eventForm.location}
              onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Enter event location"
              required
              maxLength="200"
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventMaxAttendees">Max Attendees</label>
            <input
              type="number"
              id="eventMaxAttendees"
              value={eventForm.maxAttendees}
              onChange={(e) =>
                setEventForm((prev) => ({ ...prev, maxAttendees: Number.parseInt(e.target.value) || 100 }))
              }
              min="1"
              max="10000"
            />
          </div>
        </div>

        <div className="form-actions">
          {eventOperation === "update" && (
            <button type="button" onClick={resetEventForm} className="btn btn-secondary">
              Cancel Edit
            </button>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Processing..." : eventOperation === "create" ? "Create Event" : "Update Event"}
          </button>
        </div>
      </form>

      <div className="crud-list">
        <h4>Events ({events.length})</h4>
        {events.length === 0 ? (
          <p className="empty-message">No events found</p>
        ) : (
          <div className="items-grid">
            {events.map((event) => (
              <div key={event.id} className="item-card">
                <h5>{event.title}</h5>
                <p className="item-meta">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
                <p className="item-meta">{event.location}</p>
                <p className="item-description">{event.description}</p>
                <div className="item-actions">
                  <button onClick={() => loadEventForEdit(event)} className="btn btn-sm btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => handleEventDelete(event.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderUserForm = () => (
    <div className="crud-section">
      <h3>{userOperation === "create" ? "Create User" : "Update User"}</h3>

      <form onSubmit={handleUserSubmit} className="crud-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userName">Name *</label>
            <input
              type="text"
              id="userName"
              value={userForm.name}
              onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="userEmail">Email *</label>
            <input
              type="email"
              id="userEmail"
              value={userForm.email}
              onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        {userOperation === "create" && (
          <div className="form-group">
            <label htmlFor="userPassword">Password *</label>
            <input
              type="password"
              id="userPassword"
              value={userForm.password}
              onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              required
              minLength="6"
            />
          </div>
        )}

        <div className="form-actions">
          {userOperation === "update" && (
            <button type="button" onClick={resetUserForm} className="btn btn-secondary">
              Cancel Edit
            </button>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Processing..." : userOperation === "create" ? "Create User" : "Update User"}
          </button>
        </div>
      </form>

      <div className="crud-list">
        <h4>Users ({users.length})</h4>
        {users.length === 0 ? (
          <p className="empty-message">No users found</p>
        ) : (
          <div className="items-grid">
            {users.map((user) => (
              <div key={user.id} className="item-card">
                <h5>{user.name}</h5>
                <p className="item-meta">{user.email}</p>
                <p className="item-meta">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                <div className="item-actions">
                  <button onClick={() => loadUserForEdit(user)} className="btn btn-sm btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => handleUserDelete(user.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="crud-forms">
      <div className="crud-header">
        <h2>CRUD Operations</h2>
        <p>Create, Read, Update, and Delete operations for all entities</p>
      </div>

      <div className="crud-tabs">
        <button className={`tab-btn ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
          Events
        </button>
        <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          Users
        </button>
        <button className={`tab-btn ${activeTab === "albums" ? "active" : ""}`} onClick={() => setActiveTab("albums")}>
          Albums
        </button>
        <button
          className={`tab-btn ${activeTab === "memories" ? "active" : ""}`}
          onClick={() => setActiveTab("memories")}
        >
          Memories
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      <div className="crud-content">
        {activeTab === "events" && renderEventForm()}
        {activeTab === "users" && renderUserForm()}
        {activeTab === "albums" && (
          <div className="crud-section">
            <h3>Album Management</h3>
            <p>Album CRUD operations are available within individual event pages.</p>
          </div>
        )}
        {activeTab === "memories" && (
          <div className="crud-section">
            <h3>Memory Management</h3>
            <p>Memory CRUD operations are available within individual album views.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CRUDForms
