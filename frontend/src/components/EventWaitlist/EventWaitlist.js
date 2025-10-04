import { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './EventWaitlist.css';

const EventWaitlist = ({ event, onRegistrationChange }) => {
  const [waitlist, setWaitlist] = useState([]);
  const [userWaitlistEntry, setUserWaitlistEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const { user } = useAuth();

  // Check if event is full
  const isEventFull = event.registrationCount >= event.maxAttendees;
  
  // Check if user is registered
  const isUserRegistered = event.registeredUsers?.includes(user?.id);
  
  // Check if user is on waitlist
  const isUserOnWaitlist = userWaitlistEntry !== null;

  // Fetch waitlist data
  const fetchWaitlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getWaitlist(event.id);
      setWaitlist(response.data.waitlist || []);
      
      // Find user's waitlist entry
      const userEntry = response.data.waitlist.find(entry => entry.user.id === user?.id);
      setUserWaitlistEntry(userEntry || null);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  }, [event.id, user?.id]);

  useEffect(() => {
    if (event.allowWaitlist) {
      fetchWaitlist();
    }
  }, [fetchWaitlist, event.allowWaitlist]);

  // Join waitlist
  const handleJoinWaitlist = async () => {
    try {
      setActionLoading(true);
      await eventsAPI.joinWaitlist(event.id);
      await fetchWaitlist();
      onRegistrationChange?.();
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('Failed to join waitlist');
    } finally {
      setActionLoading(false);
    }
  };

  // Leave waitlist
  const handleLeaveWaitlist = async () => {
    try {
      setActionLoading(true);
      await eventsAPI.leaveWaitlist(event.id);
      await fetchWaitlist();
      onRegistrationChange?.();
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      alert('Failed to leave waitlist');
    } finally {
      setActionLoading(false);
    }
  };

  // Format waitlist position
  const formatPosition = (position) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  // Get waitlist status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#ffc107';
      case 'notified': return '#17a2b8';
      case 'registered': return '#28a745';
      case 'expired': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Waitlist entry component
  const WaitlistEntry = ({ entry, isUserEntry = false }) => (
    <div className={`waitlist-entry ${isUserEntry ? 'user-entry' : ''}`}>
      <div className="entry-position">
        <span className="position-number">{entry.position}</span>
      </div>
      <div className="entry-user">
        <div className="user-avatar">
          {entry.user.avatar ? (
            <img src={entry.user.avatar} alt={entry.user.name} />
          ) : (
            <span>{entry.user.name.charAt(0)}</span>
          )}
        </div>
        <div className="user-info">
          <span className="user-name">{entry.user.name}</span>
          <span className="entry-date">
            Joined {new Date(entry.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="entry-status">
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(entry.status) }}
        >
          {entry.status}
        </span>
      </div>
    </div>
  );

  if (!event.allowWaitlist) {
    return null;
  }

  return (
    <div className="event-waitlist">
      {/* Waitlist Status */}
      <div className="waitlist-status">
        {isEventFull && (
          <div className="event-full-notice">
            <div className="full-icon">⚠️</div>
            <div className="full-message">
              <h4>Event is Full</h4>
              <p>This event has reached its maximum capacity of {event.maxAttendees} attendees.</p>
            </div>
          </div>
        )}

        {isUserOnWaitlist && (
          <div className="user-waitlist-status">
            <div className="status-icon">📋</div>
            <div className="status-message">
              <h4>You're on the Waitlist</h4>
              <p>
                You're in {formatPosition(userWaitlistEntry.position)} position. 
                You'll be notified if a spot becomes available.
              </p>
            </div>
          </div>
        )}

        {/* Waitlist Actions */}
        {!isUserRegistered && (
          <div className="waitlist-actions">
            {!isUserOnWaitlist ? (
              <button
                className="btn btn-primary waitlist-btn"
                onClick={handleJoinWaitlist}
                disabled={actionLoading}
              >
                {actionLoading ? 'Joining...' : 'Join Waitlist'}
              </button>
            ) : (
              <button
                className="btn btn-secondary waitlist-btn"
                onClick={handleLeaveWaitlist}
                disabled={actionLoading}
              >
                {actionLoading ? 'Leaving...' : 'Leave Waitlist'}
              </button>
            )}
          </div>
        )}

        {/* Waitlist Info */}
        {waitlist.length > 0 && (
          <div className="waitlist-info">
            <p>
              <strong>{waitlist.length}</strong> people on waitlist
              {isUserOnWaitlist && (
                <span> • You're in {formatPosition(userWaitlistEntry.position)} position</span>
              )}
            </p>
            <button
              className="view-waitlist-btn"
              onClick={() => setShowWaitlist(!showWaitlist)}
            >
              {showWaitlist ? 'Hide' : 'View'} Waitlist
            </button>
          </div>
        )}
      </div>

      {/* Waitlist Details */}
      {showWaitlist && (
        <div className="waitlist-details">
          <div className="waitlist-header">
            <h4>Waitlist ({waitlist.length})</h4>
            <p>People waiting for a spot to become available</p>
          </div>

          {loading ? (
            <div className="loading-waitlist">
              <div className="loading-spinner"></div>
              <p>Loading waitlist...</p>
            </div>
          ) : waitlist.length > 0 ? (
            <div className="waitlist-entries">
              {waitlist.map(entry => (
                <WaitlistEntry
                  key={entry.id}
                  entry={entry}
                  isUserEntry={entry.user.id === user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-waitlist">
              <p>No one on the waitlist yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventWaitlist;
