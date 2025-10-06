/**
 * Main App Component
 * Root component that manages routing and global state
 * Handles Socket.IO connection and user authentication
 */

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Polls from './components/Polls';
import Users from './components/Users';
import Login from './components/Login';
import './App.css';

// Socket.IO connection configuration
const SOCKET_URL = 'http://localhost:5000';
let socket = null;

function App() {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    users: { total: 0, active: 0, offline: 0 },
    messages: { total: 0, today: 0 },
    polls: { total: 0, active: 0, totalVotes: 0 }
  });

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Connect to Socket.IO
      socket = io(`${SOCKET_URL}/collaboration`, {
        transports: ['websocket', 'polling']
      });

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to server');
        
        // Join as user
        socket.emit('user:join', {
          userId: currentUser._id,
          username: currentUser.username
        });
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
      });

      // User events
      socket.on('user:authenticated', (data) => {
        console.log('User authenticated:', data.user);
      });

      socket.on('users:list', (data) => {
        setUsers(data.users);
      });

      socket.on('user:joined', (data) => {
        setUsers(prev => {
          const exists = prev.find(u => u._id === data.user._id);
          if (exists) {
            return prev.map(u => u._id === data.user._id ? data.user : u);
          }
          return [...prev, data.user];
        });
      });

      socket.on('user:left', (data) => {
        setUsers(prev => prev.map(u => 
          u._id === data.userId ? { ...u, isActive: false, status: 'offline' } : u
        ));
      });

      socket.on('user:created', (data) => {
        setUsers(prev => [...prev, data.user]);
      });

      socket.on('user:updated', (data) => {
        setUsers(prev => prev.map(u => u._id === data.user._id ? data.user : u));
      });

      socket.on('user:deleted', (data) => {
        setUsers(prev => prev.filter(u => u._id !== data.userId));
      });

      // Message events
      socket.on('message:new', (data) => {
        setMessages(prev => [data.message, ...prev]);
      });

      socket.on('message:updated', (data) => {
        setMessages(prev => prev.map(m => m._id === data.message._id ? data.message : m));
      });

      socket.on('message:deleted', (data) => {
        setMessages(prev => prev.filter(m => m._id !== data.messageId));
      });

      // Poll events
      socket.on('poll:new', (data) => {
        setPolls(prev => [data.poll, ...prev]);
      });

      socket.on('poll:updated', (data) => {
        setPolls(prev => prev.map(p => p._id === data.poll._id ? data.poll : p));
      });

      socket.on('poll:deleted', (data) => {
        setPolls(prev => prev.filter(p => p._id !== data.pollId));
      });

      // Dashboard stats updates
      socket.on('dashboard:statsUpdate', (data) => {
        setDashboardStats(data);
      });

      // Error handling
      socket.on('error', (data) => {
        console.error('Socket error:', data.message);
        alert(`Error: ${data.message}`);
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Fetch initial data from REST API
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch(`${SOCKET_URL}/api/users`);
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.data);

      // Fetch messages
      const messagesRes = await fetch(`${SOCKET_URL}/api/messages/recent?limit=50`);
      const messagesData = await messagesRes.json();
      if (messagesData.success) setMessages(messagesData.data.reverse());

      // Fetch polls
      const pollsRes = await fetch(`${SOCKET_URL}/api/polls`);
      const pollsData = await pollsRes.json();
      if (pollsData.success) setPolls(pollsData.data);

      // Fetch stats
      const userStatsRes = await fetch(`${SOCKET_URL}/api/users/stats`);
      const messageStatsRes = await fetch(`${SOCKET_URL}/api/messages/stats`);
      const pollStatsRes = await fetch(`${SOCKET_URL}/api/polls/stats`);

      const userStats = await userStatsRes.json();
      const messageStats = await messageStatsRes.json();
      const pollStats = await pollStatsRes.json();

      setDashboardStats({
        users: userStats.data,
        messages: messageStats.data,
        polls: pollStats.data
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  /**
   * Render login screen if not authenticated
   */
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  /**
   * Main application render
   */
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Collaboration Hub</h1>
          <div className="user-info">
            <span className="username">{currentUser?.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="navigation">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`nav-tab ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          Polls
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={dashboardStats}
            users={users}
            messages={messages}
            polls={polls}
          />
        )}
        {activeTab === 'chat' && (
          <Chat
            socket={socket}
            currentUser={currentUser}
            messages={messages}
            users={users}
          />
        )}
        {activeTab === 'polls' && (
          <Polls
            socket={socket}
            currentUser={currentUser}
            polls={polls}
          />
        )}
        {activeTab === 'users' && (
          <Users
            socket={socket}
            currentUser={currentUser}
            users={users}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Collaboration Hub v1.0 • Real-time collaboration made simple</p>
      </footer>
    </div>
  );
}

export default App;