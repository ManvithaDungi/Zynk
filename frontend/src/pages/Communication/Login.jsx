/**
 * Login Component (CLASS COMPONENT)
 * Handles user authentication and login to the collaboration hub
 * Allows users to select existing user or create new account
 * 
 * NOTE: This is a CLASS COMPONENT demonstrating class-based React syntax
 */

import React, { Component } from 'react';
import './Login.css';

const API_URL = 'http://localhost:5000/api';

// CLASS COMPONENT IMPLEMENTATION
class Login extends Component {
  constructor(props) {
    super(props);
    
    // Initialize state in constructor
    this.state = {
      existingUsers: [],
      selectedUser: '',
      newUsername: '',
      newEmail: '',
      loginMode: 'existing', // 'existing' or 'new'
      loading: false,
      error: ''
    };
  }

  /**
   * Lifecycle method - runs after component mounts
   * Equivalent to useEffect with empty dependency array
   */
  componentDidMount() {
    this.fetchUsers();
  }

  /**
   * Fetch all users from API
   */
  fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      
      if (data.success) {
        this.setState({ existingUsers: data.data });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      this.setState({ error: 'Failed to load users' });
    }
  };

  /**
   * Handle login with existing user
   */
  handleExistingLogin = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });

    if (!this.state.selectedUser) {
      this.setState({ error: 'Please select a user' });
      return;
    }

    this.setState({ loading: true });

    try {
      const user = this.state.existingUsers.find(u => u._id === this.state.selectedUser);
      
      if (user) {
        // Set user as active
        await fetch(`${API_URL}/users/${user._id}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        this.props.onLogin(user);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.setState({ error: 'Failed to login. Please try again.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  /**
   * Handle create new user and login
   */
  handleNewUserLogin = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });

    // Validation
    if (!this.state.newUsername.trim()) {
      this.setState({ error: 'Username is required' });
      return;
    }

    if (!this.state.newEmail.trim()) {
      this.setState({ error: 'Email is required' });
      return;
    }

    if (!this.state.newEmail.includes('@')) {
      this.setState({ error: 'Please enter a valid email' });
      return;
    }

    this.setState({ loading: true });

    try {
      // Create new user
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.newUsername,
          email: this.state.newEmail,
          status: 'online'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Activate the new user
        await fetch(`${API_URL}/users/${data.data._id}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        this.props.onLogin(data.data);
      } else {
        this.setState({ error: data.message || 'Failed to create user' });
      }
    } catch (error) {
      console.error('Create user error:', error);
      this.setState({ error: 'Failed to create user. Please try again.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  /**
   * Render method - required in class components
   */
  render() {
    const { existingUsers, selectedUser, newUsername, newEmail, loginMode, loading, error } = this.state;

    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-title">Collaboration Hub</h1>
            <p className="login-subtitle">Real-time collaboration made simple</p>
          </div>

          {/* Login Mode Toggle */}
          <div className="login-mode-toggle">
            <button
              className={`mode-btn ${loginMode === 'existing' ? 'active' : ''}`}
              onClick={() => this.setState({ loginMode: 'existing' })}
            >
              Existing User
            </button>
            <button
              className={`mode-btn ${loginMode === 'new' ? 'active' : ''}`}
              onClick={() => this.setState({ loginMode: 'new' })}
            >
              New User
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Existing User Login */}
          {loginMode === 'existing' && (
            <form onSubmit={this.handleExistingLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="user-select">Select Your Account</label>
                <select
                  id="user-select"
                  value={selectedUser}
                  onChange={(e) => this.setState({ selectedUser: e.target.value })}
                  className="login-select"
                  disabled={loading}
                >
                  <option value="">-- Choose a user --</option>
                  {existingUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading || !selectedUser}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* New User Registration */}
          {loginMode === 'new' && (
            <form onSubmit={this.handleNewUserLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="new-username">Username</label>
                <input
                  type="text"
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => this.setState({ newUsername: e.target.value })}
                  placeholder="Enter your username"
                  className="login-input"
                  disabled={loading}
                  minLength={3}
                  maxLength={30}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-email">Email</label>
                <input
                  type="email"
                  id="new-email"
                  value={newEmail}
                  onChange={(e) => this.setState({ newEmail: e.target.value })}
                  placeholder="Enter your email"
                  className="login-input"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading || !newUsername || !newEmail}
              >
                {loading ? 'Creating Account...' : 'Create & Login'}
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }
}

// Export the CLASS COMPONENT
export default Login;