import { useState } from 'react';
import './EventShare.css';

const EventShare = ({ event }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate share URLs
  const eventUrl = `${window.location.origin}/event/${event.id}`;
  const eventTitle = event.title;
  const eventDescription = event.description;
  const eventDate = new Date(event.date).toLocaleDateString();
  const eventLocation = event.location;

  // Social media share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${eventTitle} - ${eventUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`,
    email: `mailto:?subject=${encodeURIComponent(`Event: ${eventTitle}`)}&body=${encodeURIComponent(`Check out this event:\n\n${eventTitle}\n${eventDescription}\n\nDate: ${eventDate}\nLocation: ${eventLocation}\n\n${eventUrl}`)}`
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share via Web Share API (mobile)
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: eventDescription,
          url: eventUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to modal
      setShowShareModal(true);
    }
  };

  // Social media icons
  const socialIcons = {
    twitter: '🐦',
    facebook: '📘',
    linkedin: '💼',
    whatsapp: '💬',
    telegram: '✈️',
    email: '📧'
  };

  return (
    <div className="event-share">
      <button
        className="share-btn"
        onClick={shareViaWebAPI}
        title="Share this event"
      >
        <span className="share-icon">📤</span>
        Share Event
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Event</h3>
              <button
                className="close-btn"
                onClick={() => setShowShareModal(false)}
              >
                ×
              </button>
            </div>

            <div className="share-content">
              <div className="event-preview">
                <h4>{eventTitle}</h4>
                <p className="event-meta">
                  📅 {eventDate} • 📍 {eventLocation}
                </p>
                <p className="event-description">
                  {eventDescription.length > 100 
                    ? `${eventDescription.substring(0, 100)}...` 
                    : eventDescription
                  }
                </p>
              </div>

              <div className="share-options">
                <h4>Share via:</h4>
                <div className="social-buttons">
                  {Object.entries(shareUrls).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-btn ${platform}`}
                      onClick={() => setShowShareModal(false)}
                    >
                      <span className="social-icon">{socialIcons[platform]}</span>
                      <span className="social-name">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="copy-link-section">
                <h4>Or copy link:</h4>
                <div className="copy-link-container">
                  <input
                    type="text"
                    value={eventUrl}
                    readOnly
                    className="link-input"
                  />
                  <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="share-stats">
                <p>
                  <strong>Share this event</strong> to help others discover it!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventShare;
