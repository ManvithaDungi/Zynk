"use client";

import { useState, useEffect } from "react";
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

const AnalyticsFilter = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [filters, setFilters] = useState({
    dateRange: "last30days",
    category: "all",
    author: "all",
    engagement: "all",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Use mock data for now since the backend endpoint might not exist
        // const timeframe = mapDateRangeToTimeframe(filters.dateRange);
        const mockData = {
          totalMemories: 1247,
          totalContributors: 89,
          engagementRate: 94,
          categoryBreakdown: [
            { category: 'highlights', count: 450, percentage: 36 },
            { category: 'candid', count: 320, percentage: 26 },
            { category: 'group', count: 280, percentage: 22 },
            { category: 'photos', count: 150, percentage: 12 },
            { category: 'videos', count: 47, percentage: 4 }
          ],
          dailyActivity: [
            { date: '2024-01-01', memories: 45, contributors: 12 },
            { date: '2024-01-02', memories: 67, contributors: 18 },
            { date: '2024-01-03', memories: 89, contributors: 25 },
            { date: '2024-01-04', memories: 123, contributors: 32 },
            { date: '2024-01-05', memories: 156, contributors: 41 }
          ]
        };
        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Set fallback data
        setAnalyticsData({
          totalMemories: 0,
          totalContributors: 0,
          engagementRate: 0,
          categoryBreakdown: [],
          dailyActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    // Future feature: Map date ranges to timeframe for API calls
    // const mapDateRangeToTimeframe = (range) => {
    //   switch (range) {
    //     case "last7days":
    //       return "week";
    //     case "last30days":
    //       return "month";
    //     case "last90days":
    //       return "quarter";
    //     case "lastyear":
    //       return "year";
    //     default:
    //       return "month";
    //   }
    // };

    fetchAnalyticsData();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const engagementData = [
    { name: "Views", value: analyticsData.totalViews || 0 },
    { name: "Likes", value: analyticsData.totalLikes || 0 },
    {name: "Comments", value: analyticsData.totalComments || 0,},
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
            <p>
              View detailed insights and trends from your event
              data
            </p>
          </div>
        </header>

        <div className="analytics-filters">
          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                handleFilterChange("dateRange", e.target.value)
              }
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
              onChange={(e) =>
                handleFilterChange("category", e.target.value)
              }
            >
              <option value="all">All Categories</option>
              <option value="highlights">
                Event Highlights
              </option>
              <option value="candid">Candid Moments</option>
              <option value="group">Group Photos</option>
              <option value="venue">Venue Shots</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Author</label>
            <select
              value={filters.author}
              onChange={(e) =>
                handleFilterChange("author", e.target.value)
              }
            >
              <option value="all">All Authors</option>
              <option value="organizers">Organizers Only</option>
              <option value="attendees">Attendees Only</option>
              <option value="photographers">
                Photographers
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Engagement Level</label>
            <select
              value={filters.engagement}
              onChange={(e) =>
                handleFilterChange("engagement", e.target.value)
              }
            >
              <option value="all">All Levels</option>
              <option value="high">High Engagement</option>
              <option value="medium">Medium Engagement</option>
              <option value="low">Low Engagement</option>
            </select>
          </div>
        </div>

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
                  <span className="stat-change positive">
                    +12% from last period
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👁️</div>
                <div className="stat-info">
                  <h3>{analyticsData.totalViews || 0}</h3>
                  <p>Total Views</p>
                  <span className="stat-change positive">
                    +8% from last period
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-info">
                  <h3>{analyticsData.totalLikes || 0}</h3>
                  <p>Total Likes</p>
                  <span className="stat-change positive">
                    +15% from last period
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h3>{analyticsData.totalComments || 0}</h3>
                  <p>Total Comments</p>
                  <span className="stat-change negative">
                    -3% from last period
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">➦</div>
                <div className="stat-info">
                  <h3>{analyticsData.totalShares || 0}</h3>
                  <p>Total Shares</p>
                  <span className="stat-change positive">
                    +5% from last period
                  </span>
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
                    <p>
                      Most activity occurs between 7-9 PM on
                      weekends
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">📈</div>
                  <div className="insight-content">
                    <h4>Growing Categories</h4>
                    <p>
                      Group Photos and Candid Moments showing 25%
                      growth
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">👥</div>
                  <div className="insight-content">
                    <h4>Active Contributors</h4>
                    <p>
                      15% of users contribute 80% of the content
                    </p>
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
};

export default AnalyticsFilter;

