import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import { eventsAPI } from "../../utils/api";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's registered events
  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await eventsAPI.getUserRegistered();
      setMyEvents(response.data.events || []);
    } catch (error) {
      console.error("Error fetching my events:", error);
      setError("Failed to load your events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  // Memoized date formatting
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Memoized event filtering
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = myEvents.filter((event) => new Date(event.date) > now);
    const past = myEvents.filter((event) => new Date(event.date) <= now);
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [myEvents]);

  // Event card component
  const EventCard = ({ event, isPast = false }) => (
    <Link to={`/event/${event.id}`} key={event.id} className={`event-card ${isPast ? 'past-event' : ''}`}>
      <div className="event-card-header">
        {event.thumbnail?.url && (
          <img
            src={event.thumbnail.url}
            alt={event.title}
            className="event-image"
            loading="lazy"
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
          <div className="event-time">🕒 {event.time}</div>
          <div className="event-location">📍 {event.location}</div>
          <div className="event-host">👤 Hosted by {event.organizer?.name || 'Unknown'}</div>
        </div>
        <div className="event-stats">
          <span>{event.registrationCount} {isPast ? 'attended' : 'registered'}</span>
        </div>
      </div>
    </Link>
  );

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
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div className="events-subsection">
                    <h3>Past Events ({pastEvents.length})</h3>
                    <div className="events-grid">
                      {pastEvents.map((event) => (
                        <EventCard key={event.id} event={event} isPast={true} />
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
              <Link to="/analytics" className="action-card">
                <div className="action-icon">📊</div>
                <h4>Post-Event Analytics</h4>
                <p>Manage memories, analytics, and privacy settings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;