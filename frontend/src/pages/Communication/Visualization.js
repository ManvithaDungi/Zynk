/**
 * Visualization Component
 * Advanced analytics and data visualization page
 * Displays charts, graphs, and detailed statistics
 */

import React, { useState, useEffect } from 'react';
import './Visualization.css';

function Visualization({ stats, users, messages, polls }) {
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'today', 'week', 'month'
  const [selectedChart, setSelectedChart] = useState('overview'); // 'overview', 'users', 'messages', 'polls'

  /**
   * Calculate user activity trends
   */
  const getUserActivityData = () => {
    const activeCount = users.filter(u => u.isActive).length;
    const offlineCount = users.filter(u => !u.isActive).length;
    const awayCount = users.filter(u => u.status === 'away').length;

    return [
      { label: 'Active', count: activeCount, percentage: users.length > 0 ? (activeCount / users.length * 100).toFixed(1) : 0, color: '#00ff00' },
      { label: 'Offline', count: offlineCount, percentage: users.length > 0 ? (offlineCount / users.length * 100).toFixed(1) : 0, color: '#999999' },
      { label: 'Away', count: awayCount, percentage: users.length > 0 ? (awayCount / users.length * 100).toFixed(1) : 0, color: '#ffff00' }
    ];
  };

  /**
   * Calculate message type distribution
   */
  const getMessageTypeData = () => {
    const textMessages = messages.filter(m => m.messageType === 'text').length;
    const systemMessages = messages.filter(m => m.messageType === 'system').length;
    const notifications = messages.filter(m => m.messageType === 'notification').length;

    return [
      { label: 'Text', count: textMessages, percentage: messages.length > 0 ? (textMessages / messages.length * 100).toFixed(1) : 0, color: '#ffffff' },
      { label: 'System', count: systemMessages, percentage: messages.length > 0 ? (systemMessages / messages.length * 100).toFixed(1) : 0, color: '#cccccc' },
      { label: 'Notification', count: notifications, percentage: messages.length > 0 ? (notifications / messages.length * 100).toFixed(1) : 0, color: '#888888' }
    ];
  };

  /**
   * Calculate poll engagement metrics
   */
  const getPollEngagementData = () => {
    const activePolls = polls.filter(p => p.isActive && p.status === 'active').length;
    const closedPolls = polls.filter(p => !p.isActive || p.status === 'closed').length;
    const totalVotes = polls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);
    const avgVotesPerPoll = polls.length > 0 ? (totalVotes / polls.length).toFixed(1) : 0;

    return {
      active: activePolls,
      closed: closedPolls,
      totalVotes,
      avgVotesPerPoll
    };
  };

  /**
   * Get top contributors (most messages sent)
   */
  const getTopContributors = () => {
    const userMessageCount = {};
    
    messages.forEach(msg => {
      const senderName = msg.senderName || 'Unknown';
      userMessageCount[senderName] = (userMessageCount[senderName] || 0) + 1;
    });

    return Object.entries(userMessageCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  /**
   * Get most voted polls
   */
  const getMostVotedPolls = () => {
    return [...polls]
      .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
      .slice(0, 5);
  };

  /**
   * Calculate engagement rate
   */
  const calculateEngagementRate = () => {
    if (users.length === 0) return 0;
    
    const activeUsers = users.filter(u => u.isActive).length;
    const usersWhoVoted = new Set();
    const usersWhoMessaged = new Set(messages.map(m => m.sender?._id || m.sender).filter(Boolean));
    
    polls.forEach(poll => {
      poll.votersList?.forEach(voterId => usersWhoVoted.add(voterId));
    });

    const engagedUsers = new Set([...usersWhoMessaged, ...usersWhoVoted]);
    return ((engagedUsers.size / users.length) * 100).toFixed(1);
  };

  /**
   * Render Simple Bar Chart
   */
  const renderBarChart = (data, title) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div className="chart-card">
        <h4 className="chart-title">{title}</h4>
        <div className="simple-chart">
          <div className="simple-bar-chart">
            {data.map((item, index) => (
              <div key={index} className="bar-column">
                <div 
                  className="bar"
                  style={{ 
                    height: `${maxValue > 0 ? (item.count / maxValue) * 100 : 0}%`,
                    backgroundColor: item.color
                  }}
                />
                <div className="bar-value">{item.count}</div>
                <div className="bar-label-small">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Simple Pie Chart
   */
  const renderPieChart = (data, title) => {
    let cumulativePercentage = 0;
    const segmentVars = {};
    
    data.forEach((item, index) => {
      segmentVars[`--segment-${index + 1}`] = item.color;
      segmentVars[`--segment-${index + 1}-percent`] = `${cumulativePercentage + parseFloat(item.percentage)}%`;
      cumulativePercentage += parseFloat(item.percentage);
    });

    return (
      <div className="chart-card">
        <h4 className="chart-title">{title}</h4>
        <div className="simple-chart">
          <div className="simple-pie" style={segmentVars}>
            <div className="pie-center"></div>
          </div>
          <div className="chart-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Line Chart
   */
  const renderLineChart = (data, title) => {
    // Mock data for line chart
    const lineData = [
      { day: 'Mon', value: 65 },
      { day: 'Tue', value: 78 },
      { day: 'Wed', value: 82 },
      { day: 'Thu', value: 71 },
      { day: 'Fri', value: 89 },
      { day: 'Sat', value: 76 },
      { day: 'Sun', value: 68 }
    ];

    const maxValue = Math.max(...lineData.map(d => d.value));
    const points = lineData.map((d, i) => {
      const x = (i / (lineData.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="chart-card">
        <h4 className="chart-title">{title}</h4>
        <div className="simple-chart">
          <div className="line-chart">
            <svg viewBox="0 0 100 100" className="line-chart-svg">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#333333"
                  strokeWidth="0.5"
                />
              ))}
              {/* Data line */}
              <polyline
                className="line-path"
                points={points}
                stroke="#ffffff"
                fill="none"
              />
              {/* Data points */}
              {lineData.map((d, i) => {
                const x = (i / (lineData.length - 1)) * 100;
                const y = 100 - (d.value / maxValue) * 100;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#ffffff"
                    className="line-point"
                  />
                );
              })}
            </svg>
          </div>
          <div className="chart-legend">
            {lineData.map((d, i) => (
              <div key={i} className="legend-item">
                <span>{d.day}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const userActivityData = getUserActivityData();
  const messageTypeData = getMessageTypeData();
  const pollEngagement = getPollEngagementData();
  const topContributors = getTopContributors();
  const mostVotedPolls = getMostVotedPolls();
  const engagementRate = calculateEngagementRate();

  return (
    <div className="visualization-container">
      {/* Visualization Header */}
      <div className="visualization-header">
        <div className="visualization-header-info">
          <h2>Visualization</h2>
          <p className="visualization-subtitle">Detailed insights and data analysis</p>
        </div>

        {/* Chart Type Selector */}
        <div className="chart-selector">
          <button
            className={`chart-btn ${selectedChart === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedChart('overview')}
          >
            Overview
          </button>
          <button
            className={`chart-btn ${selectedChart === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedChart('users')}
          >
            Users
          </button>
          <button
            className={`chart-btn ${selectedChart === 'messages' ? 'active' : ''}`}
            onClick={() => setSelectedChart('messages')}
          >
            Messages
          </button>
          <button
            className={`chart-btn ${selectedChart === 'polls' ? 'active' : ''}`}
            onClick={() => setSelectedChart('polls')}
          >
            Polls
          </button>
        </div>
      </div>
       
      {/* Overview Charts */}
      {selectedChart === 'overview' && (
        <div className="charts-section">
          <h3 className="section-title">Platform Overview</h3>
          
          <div className="charts-grid">
            {/* User Activity Pie Chart */}
            {renderPieChart(userActivityData, "User Activity Distribution")}

            {/* Message Types Bar Chart */}
            {renderBarChart(messageTypeData, "Message Types Distribution")}

            {/* Activity Trend Line Chart */}
            {renderLineChart([], "Weekly Activity Trend")}
          </div>
        </div>
      )}

      {/* User-specific Charts */}
      {selectedChart === 'users' && (
        <div className="charts-section">
          <h3 className="section-title">User Analytics</h3>
          
          <div className="charts-grid">
            {renderPieChart(userActivityData, "User Status Distribution")}
            {renderBarChart(userActivityData, "User Activity Breakdown")}
            {renderLineChart([], "User Growth Over Time")}
          </div>
        </div>
      )}

      {/* Message-specific Charts */}
      {selectedChart === 'messages' && (
        <div className="charts-section">
          <h3 className="section-title">Message Analytics</h3>
          
          <div className="charts-grid">
            {renderPieChart(messageTypeData, "Message Types Distribution")}
            {renderBarChart(messageTypeData, "Message Volume by Type")}
            {renderLineChart([], "Message Volume Over Time")}
          </div>
        </div>
      )}

      {/* Poll-specific Charts */}
      {selectedChart === 'polls' && (
        <div className="charts-section">
          <h3 className="section-title">Poll Analytics</h3>
          
          <div className="charts-grid">
            <div className="chart-card">
              <h4 className="chart-title">Poll Status Distribution</h4>
              <div className="chart-content">
                <div className="chart-bar-item">
                  <div className="bar-label">
                    <span className="bar-label-text">Active Polls</span>
                    <span className="bar-label-value">{pollEngagement.active}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill poll-active"
                      style={{ width: `${polls.length > 0 ? (pollEngagement.active / polls.length * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="chart-bar-item">
                  <div className="bar-label">
                    <span className="bar-label-text">Closed Polls</span>
                    <span className="bar-label-value">{pollEngagement.closed}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill poll-closed"
                      style={{ width: `${polls.length > 0 ? (pollEngagement.closed / polls.length * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderLineChart([], "Poll Creation Trend")}
            
            <div className="chart-card">
              <h4 className="chart-title">Poll Engagement</h4>
              <div className="chart-content">
                <div className="chart-bar-item">
                  <div className="bar-label">
                    <span className="bar-label-text">Total Votes</span>
                    <span className="bar-label-value">{pollEngagement.totalVotes}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill poll-votes"
                      style={{ width: `${Math.min((pollEngagement.totalVotes / (polls.length * 10) * 100), 100)}%` }}
                    />
                  </div>
                </div>
                <div className="chart-bar-item">
                  <div className="bar-label">
                    <span className="bar-label-text">Average Votes per Poll</span>
                    <span className="bar-label-value">{pollEngagement.avgVotesPerPoll}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill poll-votes"
                      style={{ width: `${Math.min((pollEngagement.avgVotesPerPoll / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {(selectedChart === 'overview' || selectedChart === 'messages') && (
        <div className="leaderboard-section">
          <h3 className="section-title">Top Contributors</h3>
          <div className="leaderboard-card">
            {topContributors.length > 0 ? (
              <div className="leaderboard-list">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="leaderboard-item">
                    <div className="leaderboard-rank">#{index + 1}</div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{contributor.name}</div>
                      <div className="leaderboard-stat">{contributor.count} messages</div>
                    </div>
                    <div className="leaderboard-badge">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && '⭐'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-leaderboard">No contributors yet</div>
            )}
          </div>
        </div>
      )}

      {/* Most Voted Polls */}
      {(selectedChart === 'overview' || selectedChart === 'polls') && (
        <div className="leaderboard-section">
          <h3 className="section-title">Most Voted Polls</h3>
          <div className="leaderboard-card">
            {mostVotedPolls.length > 0 ? (
              <div className="leaderboard-list">
                {mostVotedPolls.map((poll, index) => (
                  <div key={index} className="leaderboard-item">
                    <div className="leaderboard-rank">#{index + 1}</div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{poll.question}</div>
                      <div className="leaderboard-stat">{poll.totalVotes || 0} votes • {poll.options?.length || 0} options</div>
                    </div>
                    <div className="leaderboard-status">
                      {poll.isActive ? '🟢' : '🔴'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-leaderboard">No polls yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Visualization;
