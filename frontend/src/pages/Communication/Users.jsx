/**
 * Users Component
 * User management system with CRUD operations
 * Displays all users with real-time updates
 */

import React, { useState } from 'react';
import './Users.css';

function Users({ socket, currentUser, users }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'offline'
  
  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('offline');

  /**
   * Handle create user
   */
  const handleCreateUser = (e) => {
    e.preventDefault();

    // Validation
    if (!newUsername.trim()) {
      alert('Username is required');
      return;
    }

    if (!newEmail.trim()) {
      alert('Email is required');
      return;
    }

    if (!newEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    // Emit user creation event
    socket.emit('user:create', {
      username: newUsername.trim(),
      email: newEmail.trim()
    });

    // Reset form
    setNewUsername('');
    setNewEmail('');
    setShowCreateForm(false);
  };

  /**
   * Handle edit user - open form
   */
  const handleEditUserOpen = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditStatus(user.status);
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  /**
   * Handle update user
   */
  const handleUpdateUser = (e) => {
    e.preventDefault();

    // Validation
    if (!editUsername.trim()) {
      alert('Username is required');
      return;
    }

    if (!editEmail.trim()) {
      alert('Email is required');
      return;
    }

    if (!editEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    // Emit user update event
    socket.emit('user:update', {
      userId: editingUser._id,
      updates: {
        username: editUsername.trim(),
        email: editEmail.trim(),
        status: editStatus
      }
    });

    // Reset form
    setEditingUser(null);
    setEditUsername('');
    setEditEmail('');
    setEditStatus('offline');
    setShowEditForm(false);
  };

  /**
   * Handle delete user
   */
  const handleDeleteUser = (userId, username) => {
    if (userId === currentUser._id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
      socket.emit('user:delete', { userId });
    }
  };

  /**
   * Cancel edit
   */
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditUsername('');
    setEditEmail('');
    setEditStatus('offline');
    setShowEditForm(false);
  };

  /**
   * Filter and search users
   */
  const filteredUsers = users.filter(user => {
    // Filter by status
    if (filterStatus === 'active' && !user.isActive) return false;
    if (filterStatus === 'offline' && user.isActive) return false;

    // Search by username or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  /**
   * Sort users - active first, then alphabetically
   */
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return a.username.localeCompare(b.username);
  });

  /**
   * Format last active time
   */
  const formatLastActive = (date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastActive.toLocaleDateString();
  };

  return (
    <div className="users-container">
      {/* Users Header */}
      <div className="users-header">
        <div className="users-header-info">
          <h2>Users</h2>
          <p className="users-subtitle">Manage collaboration hub users</p>
        </div>
        <button 
          className="create-user-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowEditForm(false);
          }}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Add User'}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="users-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({users.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            🟢 Active ({users.filter(u => u.isActive).length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'offline' ? 'active' : ''}`}
            onClick={() => setFilterStatus('offline')}
          >
            ⚪ Offline ({users.filter(u => !u.isActive).length})
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="user-form-container">
          <h3>Add New User</h3>
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-group">
              <label htmlFor="new-username">Username *</label>
              <input
                type="text"
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="form-input"
                minLength={3}
                maxLength={30}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-email">Email *</label>
              <input
                type="email"
                id="new-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                className="form-input"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Create User
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <div className="user-form-container">
          <h3>Edit User: {editingUser.username}</h3>
          <form onSubmit={handleUpdateUser} className="user-form">
            <div className="form-group">
              <label htmlFor="edit-username">Username *</label>
              <input
                type="text"
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
                className="form-input"
                minLength={3}
                maxLength={30}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-email">Email *</label>
              <input
                type="email"
                id="edit-email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email address"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="form-select"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="away">Away</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Update User
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="users-list">
        {sortedUsers.length === 0 ? (
          <div className="empty-users">
            {/* <div className="empty-users-icon">👥</div> */}
            <p>No users found matching your search.</p>
          </div>
        ) : (
          <div className="users-grid">
            {sortedUsers.map(user => {
              const isCurrentUser = user._id === currentUser._id;

              return (
                <div key={user._id} className={`user-card ${user.isActive ? 'active' : 'offline'}`}>
                  {/* User Avatar */}
                  <div className="user-card-avatar">
                    <div className={`avatar ${user.isActive ? 'active' : ''}`}>
                      {user.avatar || user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`status-indicator ${user.status}`}></div>
                  </div>

                  {/* User Info */}
                  <div className="user-card-info">
                    <h3 className="user-card-name">
                      {user.username}
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </h3>
                    <p className="user-card-email">{user.email}</p>
                    
                    <div className="user-card-meta">
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'online' && '🟢'}
                        {user.status === 'offline' && '⚪'}
                        {user.status === 'away' && '🟡'}
                        {' '}{user.status}
                      </span>
                      <span className="last-active">
                        Last active: {formatLastActive(user.lastActive)}
                      </span>
                    </div>

                    <div className="user-card-details">
                      <span className="detail-item">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div className="user-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditUserOpen(user)}
                      title="Edit user"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user._id, user.username)}
                      disabled={isCurrentUser}
                      title={isCurrentUser ? 'Cannot delete yourself' : 'Delete user'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Users Stats Footer */}
      <div className="users-footer">
        <div className="users-stats">
          <span className="stat-item">
            Total Users: {users.length}
          </span>
          <span className="stat-item">
            Active: {users.filter(u => u.isActive).length}
          </span>
          <span className="stat-item">
            Offline: {users.filter(u => !u.isActive).length}
          </span>
          <span className="stat-item">
            Activity Rate: {users.length > 0 ? ((users.filter(u => u.isActive).length / users.length) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default Users;