"use client";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AnalyticsFilter.css";

class AnalyticsFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analyticsData: {},
      filters: {
        dateRange: "last30days",
        category: "all",
        author: "all",
        engagement: "all",
      },
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchAnalyticsData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.filters !== this.state.filters) {
      this.fetchAnalyticsData();
    }
  }

  mapDateRangeToTimeframe = (range) => {
    switch (range) {
      case "last7days":
        return "week";
      case "last30days":
        return "month";
      case "last90days":
        return "quarter";
      case "lastyear":
        return "year";
      default:
        return "month";
    }
  };

  fetchAnalyticsData = async () => {
    this.setState({ loading: true });
    try {
      const timeframe = this.mapDateRangeToTimeframe(this.state.filters.dateRange);
      const response = await fetch(`/api/analyticsFilter?timeframe=${timeframe}`);
      const data = await response.json();
      this.setState({ analyticsData: data });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleFilterChange = (filterType, value) => {
    this.setState((prevState) => ({
      filters: { ...prevState.filters, [filterType]: value },
    }));
  };

  render() {
    const { analyticsData, filters, loading } = this.state;

    const engagementData = [
      { name: "Views", value: analyticsData.totalViews || 0 },
      { name: "Likes", value: analyticsData.totalLikes || 0 },
      { name: "Comments", value: analyticsData.totalComments || 0 },
      { name: "Shares", value: analyticsData.totalShares || 0 },
    ];

    return (
      <div className="analytics-filter">
        <div className="container">
          <header className="page-header">
            <Link to="/home-page" className="back-btn">
              ← Back to Dashboard
            </Link>
            <div className="header-content">
              <div className="header-icon">📊</div>
              <h1>Analytics Dashboard</h1>
              <p>View detailed insights and trends from your event data</p>
            </div>
          </header>

          {/* Filters */}
          <div className="analytics-filters">
            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => this.handleFilterChange("dateRange", e.target.value)}
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="lastyear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => this.handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="highlights">Event Highlights</option>
                <option value="candid">Candid Moments</option>
                <option value="group">Group Photos</option>
                <option value="venue">Venue Shots</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Author</label>
              <select
                value={filters.author}
                onChange={(e) => this.handleFilterChange("author", e.target.value)}
              >
                <option value="all">All Authors</option>
                <option value="organizers">Organizers Only</option>
                <option value="attendees">Attendees Only</option>
                <option value="photographers">Photographers</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Engagement Level</label>
              <select
                value={filters.engagement}
                onChange={(e) => this.handleFilterChange("engagement", e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="high">High Engagement</option>
                <option value="medium">Medium Engagement</option>
                <option value="low">Low Engagement</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading analytics data...</p>
            </div>
          ) : (
            <div className="analytics-content">
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">📸</div>
                  <div className="stat-info">
                    <h3>{analyticsData.totalMemories || 0}</h3>
                    <p>Total Memories</p>
                    <span className="stat-change positive">+12% from last period</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-info">
                    <h3>{analyticsData.totalViews || 0}</h3>
                    <p>Total Views</p>
                    <span className="stat-change positive">+8% from last period</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-info">
                    <h3>{analyticsData.totalLikes || 0}</h3>
                    <p>Total Likes</p>
                    <span className="stat-change positive">+15% from last period</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <h3>{analyticsData.totalComments || 0}</h3>
                    <p>Total Comments</p>
                    <span className="stat-change negative">-3% from last period</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">➦</div>
                  <div className="stat-info">
                    <h3>{analyticsData.totalShares || 0}</h3>
                    <p>Total Shares</p>
                    <span className="stat-change positive">+5% from last period</span>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-container">
                  <h3>Engagement Metrics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="insights-section">
                <h3>Key Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">🔥</div>
                    <div className="insight-content">
                      <h4>Peak Engagement Time</h4>
                      <p>Most activity occurs between 7-9 PM on weekends</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h4>Growing Categories</h4>
                      <p>Group Photos and Candid Moments showing 25% growth</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">👥</div>
                    <div className="insight-content">
                      <h4>Active Contributors</h4>
                      <p>15% of users contribute 80% of the content</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">⭐</div>
                    <div className="insight-content">
                      <h4>Quality Score</h4>
                      <p>Average memory rating is 4.2/5 stars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AnalyticsFilter;
