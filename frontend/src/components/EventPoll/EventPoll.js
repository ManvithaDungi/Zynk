import { useState, useEffect, useCallback } from 'react';
import { pollsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './EventPoll.css';

const EventPoll = ({ eventId, canCreatePoll = false, isModal = false }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePoll, setActivePoll] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [showResults, setShowResults] = useState({});
  const { user } = useAuth();

  // Create poll form state
  const [pollForm, setPollForm] = useState({
    question: '',
    options: ['', ''],
    allowMultipleVotes: false,
    expiresAt: ''
  });

  // Fetch polls for event
  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getByEvent(eventId);
      setPolls(response.data.polls || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // Enhanced poll vote handling with better feedback
  const handleVote = useCallback(async (pollId, optionIndex) => {
    try {
      setActivePoll(pollId);
      await pollsAPI.vote(pollId, { optionIndex });
      setVoteCount(prev => prev + 1);
      setShowResults(prev => ({ ...prev, [pollId]: true }));
      // Refresh polls to show updated results
      await fetchPolls();
    } catch (error) {
      console.error('Error voting on poll:', error);
      alert('Failed to vote on poll. Please try again.');
    } finally {
      setActivePoll(null);
    }
  }, [fetchPolls]);

  // Enhanced create poll functionality
  const handleCreatePoll = useCallback(async (e) => {
    e.preventDefault();
    if (!pollForm.question.trim() || pollForm.options.filter(opt => opt.trim()).length < 2) {
      alert('Please provide a question and at least 2 options');
      return;
    }

    try {
      setSubmitting(true);
      await pollsAPI.create({
        event: eventId,
        question: pollForm.question,
        options: pollForm.options.filter(opt => opt.trim()),
        allowMultipleVotes: pollForm.allowMultipleVotes,
        expiresAt: pollForm.expiresAt || null
      });

      // Reset form and refresh polls
      setPollForm({
        question: '',
        options: ['', ''],
        allowMultipleVotes: false,
        expiresAt: ''
      });
      setShowCreateForm(false);
      await fetchPolls();
      
      // Show success feedback
      alert('Poll created successfully! 🎉');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [pollForm, eventId, fetchPolls]);

  // Add option to poll form
  const addOption = () => {
    if (pollForm.options.length < 6) {
      setPollForm(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  // Remove option from poll form
  const removeOption = (index) => {
    if (pollForm.options.length > 2) {
      setPollForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  // Update option text
  const updateOption = (index, value) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Check if user has voted on poll
  const hasUserVoted = (poll) => {
    return poll.options.some(option => 
      option.votes.some(vote => vote.user === user?.id)
    );
  };

  // Get user's vote for poll
  const getUserVote = (poll) => {
    for (let i = 0; i < poll.options.length; i++) {
      if (poll.options[i].votes.some(vote => vote.user === user?.id)) {
        return i;
      }
    }
    return -1;
  };

  // Calculate percentage for option
  const getOptionPercentage = (option, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((option.votes.length / totalVotes) * 100);
  };

  // Poll card component
  const PollCard = ({ poll }) => {
    const totalVotes = poll.totalVotes;
    const userVoted = hasUserVoted(poll);
    const userVoteIndex = getUserVote(poll);
    const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

    return (
      <div className="poll-card">
        <div className="poll-header">
          <h4>{poll.question}</h4>
          <div className="poll-meta">
            <span className="vote-count">{totalVotes} votes</span>
            {poll.expiresAt && (
              <span className="expires-at">
                Expires: {new Date(poll.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="poll-options">
          {poll.options.map((option, index) => {
            const percentage = getOptionPercentage(option, totalVotes);
            const isUserVote = userVoted && userVoteIndex === index;

            return (
              <div
                key={index}
                className={`poll-option ${isUserVote ? 'user-vote' : ''} ${isExpired ? 'expired' : ''}`}
              >
                <button
                  className="option-button"
                  onClick={() => !userVoted && !isExpired && handleVote(poll.id, index)}
                  disabled={userVoted || isExpired}
                >
                  <div className="option-content">
                    <span className="option-text">{option.text}</span>
                    <span className="option-votes">
                      {option.votes.length} votes ({percentage}%)
                    </span>
                  </div>
                  <div className="option-bar">
                    <div
                      className="option-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {userVoted && (
          <div className="poll-status">
            ✓ You voted for "{poll.options[userVoteIndex].text}"
          </div>
        )}

        {isExpired && (
          <div className="poll-status expired">
            This poll has expired
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="event-poll-section">
        <div className="loading-spinner"></div>
        <p>Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="event-poll-section">
      <div className="polls-header">
        <h3>Event Polls</h3>
        {canCreatePoll && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Poll
          </button>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Poll</h3>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>Poll Question *</label>
                <input
                  type="text"
                  value={pollForm.question}
                  onChange={(e) => setPollForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What would you like to ask?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Options *</label>
                {pollForm.options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {pollForm.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="remove-option-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollForm.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="add-option-btn"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={pollForm.allowMultipleVotes}
                    onChange={(e) => setPollForm(prev => ({ ...prev, allowMultipleVotes: e.target.checked }))}
                  />
                  Allow multiple votes
                </label>
              </div>

              <div className="form-group">
                <label>Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={pollForm.expiresAt}
                  onChange={(e) => setPollForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Polls List */}
      {polls.length > 0 ? (
        <div className="polls-list">
          {polls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="no-polls">
          <p>No polls yet. {canCreatePoll && 'Create the first poll for this event!'}</p>
        </div>
      )}
    </div>
  );
};

export default EventPoll;
