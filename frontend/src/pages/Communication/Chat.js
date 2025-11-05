/**
 * Chat Component
 * Real-time chat messaging system with Socket.IO
 * Supports sending, editing, deleting messages and typing indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ socket, currentUser, messages, users }) {
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Listen for typing indicators
   */
  useEffect(() => {
    if (socket) {
      socket.on('message:userTyping', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }
      });

      return () => {
        socket.off('message:userTyping');
      };
    }
  }, [socket]);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = () => {
    if (socket) {
      socket.emit('message:typing', {
        username: currentUser.username,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('message:typing', {
          username: currentUser.username,
          isTyping: false
        });
      }, 2000);
    }
  };

  /**
   * Handle send message
   */
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    if (editingMessage) {
      // Edit existing message
      socket.emit('message:edit', {
        messageId: editingMessage._id,
        content: messageInput.trim()
      });
      setEditingMessage(null);
    } else {
      // Send new message
      socket.emit('message:send', {
        sender: currentUser._id,
        senderName: currentUser.username,
        content: messageInput.trim(),
        messageType: 'text'
      });
    }

    setMessageInput('');

    // Stop typing indicator
    if (socket) {
      socket.emit('message:typing', {
        username: currentUser.username,
        isTyping: false
      });
    }
  };

  /**
   * Handle edit message
   */
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageInput(message.content);
  };

  /**
   * Cancel edit
   */
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageInput('');
  };

  /**
   * Handle delete message
   */
  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('message:delete', { messageId });
    }
  };

  /**
   * Filter messages based on search query
   */
  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Format timestamp
   */
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  /**
   * Group messages by date
   */
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>Chat Room</h2>
          <p className="chat-subtitle">
            {users.filter(u => u.isActive).length} active users
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.keys(groupedMessages).map(date => (
            <div key={date} className="message-date-group">
              {/* Date Divider */}
              <div className="date-divider">
                <span className="date-label">{date}</span>
              </div>

              {/* Messages for this date */}
              {groupedMessages[date].map(msg => {
                const isOwnMessage = msg.sender?._id === currentUser._id;
                const messageType = msg.messageType || 'text';

                return (
                  <div
                    key={msg._id}
                    className={`message ${isOwnMessage ? 'own-message' : 'other-message'} ${messageType}`}
                  >
                    {/* Avatar for other users */}
                    {!isOwnMessage && (
                      <div className="message-avatar">
                        {msg.sender?.avatar || msg.senderName.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="message-content-wrapper">
                      {/* Sender Name (for other users) */}
                      {!isOwnMessage && (
                        <div className="message-sender-name">{msg.senderName}</div>
                      )}

                      {/* Message Bubble */}
                      <div className="message-bubble">
                        <div className="message-text">{msg.content}</div>
                        
                        {/* Message Footer */}
                        <div className="message-footer">
                          <span className="message-time">{formatTime(msg.createdAt)}</span>
                          {msg.isEdited && <span className="edited-label">(edited)</span>}
                        </div>
                      </div>

                      {/* Message Actions (for own messages) */}
                      {isOwnMessage && (
                        <div className="message-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditMessage(msg)}
                            title="Edit message"
                          >
                            edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteMessage(msg._id)}
                            title="Delete message"
                          >
                            delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Avatar for own messages */}
                    {isOwnMessage && (
                      <div className="message-avatar own-avatar">
                        {currentUser.avatar || currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-avatar">✍️</div>
            <div className="typing-text">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="message-input-area">
        {editingMessage && (
          <div className="editing-banner">
            <span>Editing message</span>
            <button className="cancel-edit-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="message-input"
            maxLength={2000}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!messageInput.trim()}
          >
            {editingMessage ? 'Update' : 'Send'}
          </button>
        </form>

        <div className="input-info">
          <span>{messageInput.length}/2000</span>
        </div>
      </div>

      {/* Online Users Sidebar */}
      <div className="chat-sidebar">
        <h3 className="sidebar-title">Online Users ({users.filter(u => u.isActive).length})</h3>
        <ul className="online-users-list">
          {users
            .filter(u => u.isActive)
            .map(user => (
              <li key={user._id} className="online-user-item">
                <div className="user-avatar-small">
                  {user.avatar || user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="user-info-small">
                  <div className="user-name-small">
                    {user.username}
                    {user._id === currentUser._id && <span className="you-label"> (You)</span>}
                  </div>
                  <div className="user-status-small">
                    <span className="status-dot-small active"></span>
                    {user.status}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;