/**
 * Polls Component
 * Real-time polling system with voting, creating, and managing polls
 * Displays live poll results with percentage charts
 */

import React, { useState } from 'react';
import './Polls.css';

function Polls({ socket, currentUser, polls }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollDescription, setNewPollDescription] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'closed'

  /**
   * Add new option field
   */
  const handleAddOption = () => {
    if (newPollOptions.length < 10) {
      setNewPollOptions([...newPollOptions, '']);
    }
  };

  /**
   * Remove option field
   */
  const handleRemoveOption = (index) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  /**
   * Update option value
   */
  const handleOptionChange = (index, value) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  /**
   * Handle create poll
   */
  const handleCreatePoll = (e) => {
    e.preventDefault();

    // Validation
    if (!newPollQuestion.trim()) {
      alert('Please enter a poll question');
      return;
    }

    const validOptions = newPollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    // Emit poll creation event
    socket.emit('poll:create', {
      question: newPollQuestion.trim(),
      description: newPollDescription.trim(),
      options: validOptions,
      createdBy: currentUser._id,
      allowMultipleVotes: allowMultipleVotes,
      pollType: allowMultipleVotes ? 'multiple' : 'single'
    });

    // Reset form
    setNewPollQuestion('');
    setNewPollDescription('');
    setNewPollOptions(['', '']);
    setAllowMultipleVotes(false);
    setShowCreateForm(false);
  };

  /**
   * Handle vote
   */
  const handleVote = (pollId, optionId) => {
    socket.emit('poll:vote', {
      pollId,
      userId: currentUser._id,
      optionId
    });
  };

  /**
   * Handle close poll
   */
  const handleClosePoll = (pollId) => {
    if (window.confirm('Are you sure you want to close this poll?')) {
      socket.emit('poll:close', { pollId });
    }
  };

  /**
   * Handle delete poll
   */
  const handleDeletePoll = (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll? This cannot be undone.')) {
      socket.emit('poll:delete', { pollId });
    }
  };

  /**
   * Check if user has voted in a poll
   */
  const hasUserVoted = (poll) => {
    return poll.votersList?.some(voterId => voterId === currentUser._id);
  };

  /**
   * Check if user voted for specific option
   */
  const hasVotedForOption = (option) => {
    return option.voters?.some(voter => voter.user === currentUser._id);
  };

  /**
   * Filter polls based on status
   */
  const filteredPolls = polls.filter(poll => {
    if (filterStatus === 'active') return poll.isActive && poll.status === 'active';
    if (filterStatus === 'closed') return !poll.isActive || poll.status === 'closed';
    return true;
  });

  /**
   * Sort polls - active first, then by date
   */
  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="polls-container">
      {/* Polls Header */}
      <div className="polls-header">
        <div className="polls-header-info">
          <h2>Polls</h2>
          <p className="polls-subtitle">Create and vote on polls in real-time</p>
        </div>
        <button 
          className="create-poll-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Poll'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="polls-filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Polls ({polls.length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          Active ({polls.filter(p => p.isActive && p.status === 'active').length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'closed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('closed')}
        >
          Closed ({polls.filter(p => !p.isActive || p.status === 'closed').length})
        </button>
      </div>

      {/* Create Poll Form */}
      {showCreateForm && (
        <div className="create-poll-form">
          <h3>Create New Poll</h3>
          <form onSubmit={handleCreatePoll}>
            <div className="form-group">
              <label htmlFor="poll-question">Question *</label>
              <input
                type="text"
                id="poll-question"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="form-input"
                maxLength={500}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="poll-description">Description (Optional)</label>
              <textarea
                id="poll-description"
                value={newPollDescription}
                onChange={(e) => setNewPollDescription(e.target.value)}
                placeholder="Provide additional context..."
                className="form-textarea"
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Options * (2-10)</label>
              {newPollOptions.map((option, index) => (
                <div key={index} className="option-input-row">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="form-input option-input"
                    maxLength={200}
                  />
                  {newPollOptions.length > 2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() => handleRemoveOption(index)}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              {newPollOptions.length < 10 && (
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={handleAddOption}
                >
                  ➕ Add Option
                </button>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowMultipleVotes}
                  onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                />
                <span>Allow multiple votes per user</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-poll-btn">
                Create Poll
              </button>
              <button
                type="button"
                className="cancel-poll-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Polls List */}
      <div className="polls-list">
        {sortedPolls.length === 0 ? (
          <div className="empty-polls">
            <div className="empty-polls-icon">📋</div>
            <p>No polls found. Create one to get started!</p>
          </div>
        ) : (
          sortedPolls.map(poll => {
            const userVoted = hasUserVoted(poll);
            const isCreator = poll.createdBy?._id === currentUser._id || poll.createdBy === currentUser._id;

            return (
              <div key={poll._id} className="poll-card">
                {/* Poll Header */}
                <div className="poll-card-header">
                  <div className="poll-info">
                    <h3 className="poll-question">{poll.question}</h3>
                    {poll.description && (
                      <p className="poll-description">{poll.description}</p>
                    )}
                    <div className="poll-meta">
                      <span className="poll-creator">By {poll.creatorName}</span>
                      <span className="poll-dot">•</span>
                      <span className="poll-date">
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                      <span className="poll-dot">•</span>
                      <span className={`poll-status ${poll.status}`}>
                        {poll.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                      </span>
                    </div>
                  </div>

                  {/* Poll Actions (for creator) */}
                  {isCreator && (
                    <div className="poll-actions">
                      {poll.isActive && (
                        <button
                          className="action-btn close-btn"
                          onClick={() => handleClosePoll(poll._id)}
                          title="Close poll"
                        >
                          Close
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePoll(poll._id)}
                        title="Delete poll"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Poll Options */}
                <div className="poll-options">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0
                      ? ((option.votes / poll.totalVotes) * 100).toFixed(1)
                      : 0;
                    const hasVoted = hasVotedForOption(option);

                    return (
                      <div
                        key={option._id}
                        className={`poll-option ${hasVoted ? 'voted' : ''}`}
                      >
                        <div className="option-content">
                          <button
                            className="vote-btn"
                            onClick={() => handleVote(poll._id, option._id)}
                            disabled={!poll.isActive || poll.status !== 'active'}
                            title={poll.isActive ? 'Click to vote' : 'Poll is closed'}
                          >
                            {hasVoted ? '✓' : '○'}
                          </button>
                          <div className="option-details">
                            <div className="option-text-row">
                              <span className="option-text">{option.optionText}</span>
                              <span className="option-stats">
                                {option.votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="option-progress-bar">
                              <div
                                className="option-progress-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Poll Footer */}
                <div className="poll-footer">
                  <span className="total-votes">
                    Total Votes: {poll.totalVotes}
                  </span>
                  {userVoted && (
                    <span className="voted-indicator">
                      You voted
                    </span>
                  )}
                  {poll.allowMultipleVotes && (
                    <span className="multiple-votes-indicator">
                      Multiple votes allowed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Polls;