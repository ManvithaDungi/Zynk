import { useState, useCallback, useMemo } from 'react';
import './EventShare.css';

const EventShare = ({ event, isModal = false }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [activeShareMethod, setActiveShareMethod] = useState(null);

  // Generate share URLs
  const eventUrl = `${window.location.origin}/event/${event.id}`;
  const eventTitle = event.title;
  const eventDescription = event.description;
  const eventDate = new Date(event.date).toLocaleDateString();
  const eventLocation = event.location;

  // Enhanced social media share URLs with better formatting
  const shareUrls = useMemo(() => ({
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎉 Check out this amazing event: ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}&hashtags=events,community`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(`Check out this event: ${eventTitle}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(eventTitle)}&summary=${encodeURIComponent(eventDescription)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`🎉 Check out this event: ${eventTitle}\n\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`🎉 ${eventTitle} - ${eventDate} at ${eventLocation}`)}`,
    email: `mailto:?subject=${encodeURIComponent(`🎉 Event Invitation: ${eventTitle}`)}&body=${encodeURIComponent(`Hi there!\n\nI wanted to share this amazing event with you:\n\n🎉 ${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}\n\nCheck it out: ${eventUrl}\n\nHope to see you there!`)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(`Check out this event: ${eventTitle}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(eventUrl)}&description=${encodeURIComponent(eventTitle)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
    discord: `https://discord.com/channels/@me` // Discord web app
  }), [eventTitle, eventUrl, eventDescription, eventDate, eventLocation]);

  // Enhanced copy to clipboard with better feedback
  const copyToClipboard = useCallback(async () => {
    try {
      const shareText = `🎉 Check out this event: ${eventTitle}\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventUrl}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopied(false), 3000);
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
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopied(false), 3000);
    }
  }, [eventUrl, eventTitle, eventDate, eventLocation]);

  // Enhanced Web Share API with better content
  const shareViaWebAPI = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🎉 ${eventTitle}`,
          text: `Check out this amazing event!\n\n📅 ${eventDate}\n📍 ${eventLocation}\n\n${eventDescription}`,
          url: eventUrl
        });
        setShareCount(prev => prev + 1);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to modal
      setShowShareModal(true);
    }
  }, [eventTitle, eventDate, eventLocation, eventDescription, eventUrl]);

  // Handle social media sharing with tracking
  const handleSocialShare = useCallback((platform) => {
    setActiveShareMethod(platform);
    setShareCount(prev => prev + 1);
    
    // Open share URL in new window
    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    // Reset active method after animation
    setTimeout(() => setActiveShareMethod(null), 1000);
  }, [shareUrls]);

  // Enhanced social media icons with better emojis
  const socialIcons = {
    twitter: '🐦',
    facebook: '📘',
    linkedin: '💼',
    whatsapp: '💬',
    telegram: '✈️',
    email: '📧',
    reddit: '🤖',
    pinterest: '📌',
    instagram: '📷',
    discord: '🎮'
  };

  // Social media names for better UX
  const socialNames = {
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Email',
    reddit: 'Reddit',
    pinterest: 'Pinterest',
    instagram: 'Instagram',
    discord: 'Discord'
  };

  // Render share content directly when in modal mode
  if (isModal) {
    return (
      <div className="event-share modal-mode">
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
                <button
                  key={platform}
                  className={`social-btn ${platform} ${activeShareMethod === platform ? 'active' : ''}`}
                  onClick={() => handleSocialShare(platform)}
                  title={`Share on ${socialNames[platform]}`}
                >
                  <span className="social-icon">{socialIcons[platform]}</span>
                  <span className="social-name">{socialNames[platform]}</span>
                  {activeShareMethod === platform && (
                    <span className="share-animation">✨</span>
                  )}
                </button>
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
            {shareCount > 0 && (
              <div className="share-counter">
                <span className="share-count-badge">
                  📊 {shareCount} share{shareCount !== 1 ? 's' : ''} this session
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular mode - render button and modal
  return (
    <div className="event-share">
      <button
        className="share-btn"
        onClick={shareViaWebAPI}
        title="Share this event"
      >
        <span className="share-icon">📤</span>
        Share Event
        {shareCount > 0 && (
          <span className="share-count">({shareCount})</span>
        )}
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
                    <button
                      key={platform}
                      className={`social-btn ${platform} ${activeShareMethod === platform ? 'active' : ''}`}
                      onClick={() => {
                        handleSocialShare(platform);
                        if (platform !== 'instagram' && platform !== 'discord') {
                          setShowShareModal(false);
                        }
                      }}
                      title={`Share on ${socialNames[platform]}`}
                    >
                      <span className="social-icon">{socialIcons[platform]}</span>
                      <span className="social-name">{socialNames[platform]}</span>
                      {activeShareMethod === platform && (
                        <span className="share-animation">✨</span>
                      )}
                    </button>
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
                {shareCount > 0 && (
                  <div className="share-counter">
                    <span className="share-count-badge">
                      📊 {shareCount} share{shareCount !== 1 ? 's' : ''} this session
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventShare;
