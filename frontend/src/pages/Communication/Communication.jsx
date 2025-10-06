import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Communication.css';

const Communication = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const isActive = (path) => {
    return location.pathname === path;
  };

  const communicationTabs = [
    { id: 'dashboard', name: 'Dashboard', path: '/communication/dashboard', icon: '📊' },
    { id: 'chat', name: 'Chat', path: '/communication/chat', icon: '💬' },
    { id: 'users', name: 'Users', path: '/communication/users', icon: '👥' },
    { id: 'polls', name: 'Polls', path: '/communication/polls', icon: '📊' },
  ];

  return (
    <div className="communication-page">
      <div className="communication-container">
        <div className="communication-header">
          <h1>Communication Hub</h1>
          <p>Manage your team communication, chat, users, and polls</p>
        </div>

        <div className="communication-tabs">
          {communicationTabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`communication-tab ${isActive(tab.path) ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </Link>
          ))}
        </div>

        <div className="communication-content">
          <div className="communication-overview">
            <h2>Welcome to Communication Hub</h2>
            <p>Choose a communication tool from the tabs above to get started:</p>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Dashboard</h3>
                <p>View communication statistics and system overview</p>
                <Link to="/communication/dashboard" className="feature-link">
                  Go to Dashboard →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Chat</h3>
                <p>Real-time messaging and team communication</p>
                <Link to="/communication/chat" className="feature-link">
                  Start Chatting →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Users</h3>
                <p>Manage team members and user permissions</p>
                <Link to="/communication/users" className="feature-link">
                  Manage Users →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Polls</h3>
                <p>Create and manage team polls and surveys</p>
                <Link to="/communication/polls" className="feature-link">
                  Create Polls →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
