/**
 * Dashboard Component
 * Displays live analytics, statistics, and data export options
 * Shows user stats, message stats, poll stats, and active users
 */

import React, { useState, useEffect } from 'react';
import { exportAPI, communicationAPI } from '../../utils/api';
import './Dashboard.css';

function Dashboard({ 
  stats: propStats = {
    users: { total: 0, active: 0, offline: 0, onlinePercentage: 0 },
    messages: { total: 0, today: 0 },
    polls: { total: 0, active: 0, totalVotes: 0 }
  }, 
  users: propUsers = [], 
  messages: propMessages = [], 
  polls: propPolls = [] 
}) {
  const [stats, setStats] = useState(propStats);
  const [users, setUsers] = useState(propUsers);
  const [messages, setMessages] = useState(propMessages);
  const [polls, setPolls] = useState(propPolls);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch dashboard data when component mounts
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!propStats && !propUsers && !propMessages && !propPolls) {
        try {
          setLoading(true);
          const [statsResponse, usersResponse, messagesResponse, pollsResponse] = await Promise.all([
            communicationAPI.getStats(),
            communicationAPI.getUsers(),
            communicationAPI.getMessages(),
            communicationAPI.getPolls()
          ]);
          
          setStats(statsResponse.data || propStats);
          setUsers(usersResponse.data.users || []);
          setMessages(messagesResponse.data.messages || []);
          setPolls(pollsResponse.data.polls || []);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [propStats, propUsers, propMessages, propPolls]);
  /**
   * Handle CSV export for users
   */
  const handleExportUsers = async () => {
    try {
      const response = await exportAPI.exportUsersCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export users error:', error);
      alert('Failed to export users data');
    }
  };

  /**
   * Handle CSV export for messages
   */
  const handleExportMessages = async () => {
    try {
      const response = await exportAPI.exportMessagesCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'messages.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export messages error:', error);
      alert('Failed to export messages data');
    }
  };

  /**
   * Handle CSV export for polls
   */
  const handleExportPolls = async () => {
    try {
      const response = await exportAPI.exportPollsCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'polls.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export polls error:', error);
      alert('Failed to export polls data');
    }
  };

  /**
   * Handle JSON export for all data
   */
  const handleExportAll = async () => {
    try {
      const response = await exportAPI.exportAllJSON();
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'communication_data.json';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export all data error:', error);
      alert('Failed to export all data');
    }
  };

  /**
   * Get active users list
   */
  const activeUsers = (users || []).filter(u => u.isActive);

  /**
   * Get recent messages (last 5)
   */
  const recentMessages = (messages || []).slice(0, 5);

  /**
   * Get active polls
   */
  const activePolls = (polls || []).filter(p => p.isActive && p.status === 'active');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">Live analytics and statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {/* User Statistics */}
        <div className="stat-card">
          {/* <div className="stat-icon"></div> */}
          <div className="stat-content">
            <h3 className="stat-title">Users</h3>
            <div className="stat-value">{stats.users.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail">
                <span className="status-dot active"></span>
                Active: {stats.users.active || 0}
              </span>
              <span className="stat-detail">
                <span className="status-dot offline"></span>
                Offline: {stats.users.offline || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Message Statistics */}
        <div className="stat-card">
          {/* <div className="stat-icon"></div> */}
          <div className="stat-content">
            <h3 className="stat-title">Messages</h3>
            <div className="stat-value">{stats.messages.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail">
                Today: {stats.messages.today || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Poll Statistics */}
        <div className="stat-card">
          {/* <div className="stat-icon"></div> */}
          <div className="stat-content">
            <h3 className="stat-title">Polls</h3>
            <div className="stat-value">{stats.polls.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail">
                Active: {stats.polls.active || 0}
              </span>
              <span className="stat-detail">
                Total Votes: {stats.polls.totalVotes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement Statistics */}
        <div className="stat-card">
          {/* <div className="stat-icon">📈</div> */}
          <div className="stat-content">
            <h3 className="stat-title">Engagement</h3>
            <div className="stat-value">
              {stats.users.onlinePercentage || 0}%
            </div>
            <div className="stat-details">
              <span className="stat-detail">
                Online Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <div className="section-header">
          <h3>Export Data</h3>
          <p>Download data in CSV or JSON format</p>
        </div>
        <div className="export-buttons">
          <button className="export-btn" onClick={handleExportUsers}>
            Export Users (CSV)
          </button>
          <button className="export-btn" onClick={handleExportMessages}>
            Export Messages (CSV)
          </button>
          <button className="export-btn" onClick={handleExportPolls}>
            Export Polls (CSV)
          </button>
          <button className="export-btn primary" onClick={handleExportAll}>
            Export All Data (JSON)
          </button>
        </div>
      </div>

      {/* Live Activity Grid */}
      <div className="activity-grid">
        {/* Active Users List */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Active Users ({activeUsers.length})</h3>
          </div>
          <div className="card-content">
            {activeUsers.length > 0 ? (
              <ul className="user-list">
                {activeUsers.map(user => (
                  <li key={user._id} className="user-item">
                    <div className="user-avatar">{user.avatar || (user.username || user.name || 'U').substring(0, 2).toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{user.username || user.name}</div>
                      <div className="user-status">
                        <span className="status-indicator active"></span>
                        {user.status}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No active users</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Recent Messages ({recentMessages.length})</h3>
          </div>
          <div className="card-content">
            {recentMessages.length > 0 ? (
              <ul className="message-list">
                {recentMessages.map(msg => (
                  <li key={msg._id} className="message-item">
                    <div className="message-header">
                      <span className="message-sender">{msg.senderName}</span>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-content">
                      {msg.content.length > 80 
                        ? msg.content.substring(0, 80) + '...' 
                        : msg.content}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Polls */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Active Polls ({activePolls.length})</h3>
          </div>
          <div className="card-content">
            {activePolls.length > 0 ? (
              <ul className="poll-list">
                {activePolls.map(poll => (
                  <li key={poll._id} className="poll-item">
                    <div className="poll-question">{poll.question}</div>
                    <div className="poll-info">
                      <span className="poll-votes">
                        {poll.totalVotes} votes
                      </span>
                      <span className="poll-options">
                        {poll.options.length} options
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No active polls</p>
              </div>
            )}
          </div>
        </div>

        {/* Poll Results Preview */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Top Poll Results</h3>
          </div>
          <div className="card-content">
            {activePolls.length > 0 && activePolls[0] ? (
              <div className="poll-results">
                <div className="poll-results-title">
                  {activePolls[0].question}
                </div>
                <div className="poll-results-options">
                  {activePolls[0].options.map((option, index) => {
                    const percentage = activePolls[0].totalVotes > 0
                      ? ((option.votes / activePolls[0].totalVotes) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <div key={index} className="poll-result-option">
                        <div className="option-label">
                          <span>{option.optionText}</span>
                          <span>{option.votes} votes ({percentage}%)</span>
                        </div>
                        <div className="option-bar">
                          <div 
                            className="option-bar-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No poll results to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="system-info">
        <p>Dashboard updates in real-time every 5 seconds</p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default Dashboard;