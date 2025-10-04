import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../utils/api';
import './EventChat.css';

const EventChat = ({ eventId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, joinEventRoom, leaveEventRoom, sendMessage, sendTyping } = useSocket();
  const { user } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch chat messages
  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const response = await chatAPI.getMessages(eventId, {
        page: pageNum,
        limit: 50
      });

      if (pageNum === 1) {
        setMessages(response.data.messages.reverse());
      } else {
        setMessages(prev => [...response.data.messages.reverse(), ...prev]);
      }

      setHasMore(response.data.pagination.current < response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  // Handle new message from socket
  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  }, [scrollToBottom]);

  // Handle typing indicators
  const handleUserTyping = useCallback((data) => {
    if (data.userId !== user?.id) {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u.userId !== data.userId), data];
        } else {
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    }
  }, [user?.id]);

  // Socket event listeners
  useEffect(() => {
    if (socket && isOpen) {
      joinEventRoom(eventId);
      fetchMessages();

      socket.on('new-message', handleNewMessage);
      socket.on('user-typing', handleUserTyping);

      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing', handleUserTyping);
        leaveEventRoom(eventId);
      };
    }
  }, [socket, isOpen, eventId, joinEventRoom, leaveEventRoom, fetchMessages, handleNewMessage, handleUserTyping]);

  // Load more messages when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMessages(page);
    }
  }, [page, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle message submission
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      sendMessage(eventId, newMessage.trim());
      setNewMessage('');
      
      // Clear typing indicator
      if (isTyping) {
        sendTyping(eventId, false);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(eventId, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTyping(eventId, false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(eventId, false);
      }
    }, 1000);
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="event-chat-overlay" onClick={onClose}>
      <div className="event-chat" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>Event Chat</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-messages" onScroll={(e) => {
          if (e.target.scrollTop === 0 && hasMore) {
            loadMoreMessages();
          }
        }}>
          {loading && messages.length === 0 ? (
            <div className="loading-messages">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            <>
              {hasMore && (
                <button
                  className="load-more-btn"
                  onClick={loadMoreMessages}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Messages'}
                </button>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.user.id === user?.id ? 'own-message' : ''}`}
                >
                  <div className="message-avatar">
                    {message.user.avatar ? (
                      <img src={message.user.avatar} alt={message.user.name} />
                    ) : (
                      <span>{message.user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{message.user.name}</span>
                      <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="message-text">{message.message}</div>
                  </div>
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">
                    {typingUsers.map(u => u.userName).join(', ')} 
                    {typingUsers.length === 1 ? ' is' : ' are'} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSubmitMessage}>
          <div className="chat-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="chat-input"
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="send-btn"
            >
              {sending ? '...' : '→'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventChat;
