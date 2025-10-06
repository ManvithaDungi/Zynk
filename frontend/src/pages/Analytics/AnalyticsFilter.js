"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer, 
} from "recharts";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Use comprehensive mock data for demonstration
        const mockData = {
          totalMemories: 2847,
          totalContributors: 156,
          engagementRate: 87.3,
          totalViews: 45620,
          totalLikes: 8924,
          totalComments: 1247,
          totalShares: 892,
          categoryBreakdown: [
            { category: 'highlights', count: 892, percentage: 31.3 },
            { category: 'candid', count: 756, percentage: 26.5 },
            { category: 'group', count: 634, percentage: 22.3 },
            { category: 'venue', count: 345, percentage: 12.1 },
            { category: 'videos', count: 220, percentage: 7.7 }
          ],
          dailyActivity: [
            { date: '2024-01-01', memories: 45, contributors: 12, views: 1200, likes: 89 },
            { date: '2024-01-02', memories: 67, contributors: 18, views: 1800, likes: 134 },
            { date: '2024-01-03', memories: 89, contributors: 25, views: 2100, likes: 178 },
            { date: '2024-01-04', memories: 123, contributors: 32, views: 2800, likes: 245 },
            { date: '2024-01-05', memories: 156, contributors: 41, views: 3200, likes: 298 },
            { date: '2024-01-06', memories: 134, contributors: 38, views: 2900, likes: 267 },
            { date: '2024-01-07', memories: 98, contributors: 28, views: 2200, likes: 189 },
            { date: '2024-01-08', memories: 112, contributors: 31, views: 2500, likes: 201 },
            { date: '2024-01-09', memories: 145, contributors: 39, views: 3100, likes: 278 },
            { date: '2024-01-10', memories: 167, contributors: 44, views: 3400, likes: 312 },
            { date: '2024-01-11', memories: 189, contributors: 47, views: 3800, likes: 345 },
            { date: '2024-01-12', memories: 203, contributors: 52, views: 4100, likes: 378 },
            { date: '2024-01-13', memories: 178, contributors: 45, views: 3600, likes: 334 },
            { date: '2024-01-14', memories: 156, contributors: 41, views: 3200, likes: 298 },
            { date: '2024-01-15', memories: 134, contributors: 38, views: 2900, likes: 267 },
            { date: '2024-01-16', memories: 145, contributors: 39, views: 3100, likes: 278 },
            { date: '2024-01-17', memories: 167, contributors: 44, views: 3400, likes: 312 },
            { date: '2024-01-18', memories: 189, contributors: 47, views: 3800, likes: 345 },
            { date: '2024-01-19', memories: 203, contributors: 52, views: 4100, likes: 378 },
            { date: '2024-01-20', memories: 178, contributors: 45, views: 3600, likes: 334 },
            { date: '2024-01-21', memories: 156, contributors: 41, views: 3200, likes: 298 },
            { date: '2024-01-22', memories: 134, contributors: 38, views: 2900, likes: 267 },
            { date: '2024-01-23', memories: 145, contributors: 39, views: 3100, likes: 278 },
            { date: '2024-01-24', memories: 167, contributors: 44, views: 3400, likes: 312 },
            { date: '2024-01-25', memories: 189, contributors: 47, views: 3800, likes: 345 },
            { date: '2024-01-26', memories: 203, contributors: 52, views: 4100, likes: 378 },
            { date: '2024-01-27', memories: 178, contributors: 45, views: 3600, likes: 334 },
            { date: '2024-01-28', memories: 156, contributors: 41, views: 3200, likes: 298 },
            { date: '2024-01-29', memories: 134, contributors: 38, views: 2900, likes: 267 },
            { date: '2024-01-30', memories: 145, contributors: 39, views: 3100, likes: 278 }
          ],
          topContributors: [
            { name: 'Sarah Johnson', memories: 89, likes: 1247, avatar: '👩‍💼' },
            { name: 'Mike Chen', memories: 76, likes: 1089, avatar: '👨‍💻' },
            { name: 'Emma Davis', memories: 65, likes: 923, avatar: '👩‍🎨' },
            { name: 'Alex Rodriguez', memories: 58, likes: 856, avatar: '👨‍🎤' },
            { name: 'Lisa Wang', memories: 52, likes: 789, avatar: '👩‍🔬' }
          ],
          popularTags: [
            { tag: '#wedding', count: 234, growth: '+15%' },
            { tag: '#celebration', count: 189, growth: '+8%' },
            { tag: '#family', count: 167, growth: '+12%' },
            { tag: '#friends', count: 145, growth: '+6%' },
            { tag: '#party', count: 123, growth: '+18%' },
            { tag: '#memories', count: 98, growth: '+4%' },
            { tag: '#love', count: 87, growth: '+22%' },
            { tag: '#fun', count: 76, growth: '+9%' }
          ],
          deviceBreakdown: [
            { device: 'Mobile', percentage: 68.5, count: 1950 },
            { device: 'Desktop', percentage: 23.2, count: 660 },
            { device: 'Tablet', percentage: 8.3, count: 237 }
          ],
          timeDistribution: [
            { hour: '00:00', memories: 12 },
            { hour: '01:00', memories: 8 },
            { hour: '02:00', memories: 5 },
            { hour: '03:00', memories: 3 },
            { hour: '04:00', memories: 2 },
            { hour: '05:00', memories: 4 },
            { hour: '06:00', memories: 8 },
            { hour: '07:00', memories: 15 },
            { hour: '08:00', memories: 23 },
            { hour: '09:00', memories: 34 },
            { hour: '10:00', memories: 45 },
            { hour: '11:00', memories: 56 },
            { hour: '12:00', memories: 67 },
            { hour: '13:00', memories: 78 },
            { hour: '14:00', memories: 89 },
            { hour: '15:00', memories: 95 },
            { hour: '16:00', memories: 102 },
            { hour: '17:00', memories: 108 },
            { hour: '18:00', memories: 115 },
            { hour: '19:00', memories: 125 },
            { hour: '20:00', memories: 134 },
            { hour: '21:00', memories: 142 },
            { hour: '22:00', memories: 98 },
            { hour: '23:00', memories: 45 }
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

  // Export Functions
  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Zynk Analytics Report', 20, 20);
      
      // Date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${filters.dateRange.replace('last', 'Last ').replace('days', ' Days').replace('year', 'Year')}`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Summary Stats
      doc.setFontSize(16);
      doc.text('Summary Statistics', 20, 65);
      
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Memories', analyticsData.totalMemories?.toLocaleString() || '0'],
        ['Total Contributors', analyticsData.totalContributors?.toLocaleString() || '0'],
        ['Engagement Rate', `${analyticsData.engagementRate || 0}%`],
        ['Total Views', analyticsData.totalViews?.toLocaleString() || '0'],
        ['Total Likes', analyticsData.totalLikes?.toLocaleString() || '0'],
        ['Total Comments', analyticsData.totalComments?.toLocaleString() || '0'],
        ['Total Shares', analyticsData.totalShares?.toLocaleString() || '0']
      ];
      
      doc.autoTable({
        startY: 75,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
      
      // Category Breakdown
      if (analyticsData.categoryBreakdown?.length > 0) {
        doc.setFontSize(16);
        doc.text('Category Breakdown', 20, doc.lastAutoTable.finalY + 20);
        
        const categoryData = analyticsData.categoryBreakdown.map(cat => [
          cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
          cat.count.toLocaleString(),
          `${cat.percentage}%`
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Category', 'Count', 'Percentage']],
          body: categoryData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 249, 250] }
        });
      }
      
      // Top Contributors
      if (analyticsData.topContributors?.length > 0) {
        doc.setFontSize(16);
        doc.text('Top Contributors', 20, doc.lastAutoTable.finalY + 20);
        
        const contributorData = analyticsData.topContributors.map((contributor, index) => [
          `#${index + 1}`,
          contributor.name,
          contributor.memories.toString(),
          contributor.likes.toString()
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Rank', 'Name', 'Memories', 'Likes']],
          body: contributorData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 249, 250] }
        });
      }
      
      // Popular Tags
      if (analyticsData.popularTags?.length > 0) {
        doc.setFontSize(16);
        doc.text('Popular Tags', 20, doc.lastAutoTable.finalY + 20);
        
        const tagData = analyticsData.popularTags.map(tag => [
          tag.tag,
          tag.count.toString(),
          tag.growth
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Tag', 'Count', 'Growth']],
          body: tagData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 249, 250] }
        });
      }
      
      // Device Usage
      if (analyticsData.deviceBreakdown?.length > 0) {
        doc.setFontSize(16);
        doc.text('Device Usage', 20, doc.lastAutoTable.finalY + 20);
        
        const deviceData = analyticsData.deviceBreakdown.map(device => [
          device.device,
          device.count.toString(),
          `${device.percentage}%`
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Device', 'Count', 'Percentage']],
          body: deviceData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 249, 250] }
        });
      }
      
      // Save the PDF
      const fileName = `zynk-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = [];
      
      // Summary data
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Memories', analyticsData.totalMemories || 0]);
      csvData.push(['Total Contributors', analyticsData.totalContributors || 0]);
      csvData.push(['Engagement Rate', `${analyticsData.engagementRate || 0}%`]);
      csvData.push(['Total Views', analyticsData.totalViews || 0]);
      csvData.push(['Total Likes', analyticsData.totalLikes || 0]);
      csvData.push(['Total Comments', analyticsData.totalComments || 0]);
      csvData.push(['Total Shares', analyticsData.totalShares || 0]);
      csvData.push([]);
      
      // Category breakdown
      if (analyticsData.categoryBreakdown?.length > 0) {
        csvData.push(['Category', 'Count', 'Percentage']);
        analyticsData.categoryBreakdown.forEach(cat => {
          csvData.push([cat.category, cat.count, cat.percentage]);
        });
        csvData.push([]);
      }
      
      // Top contributors
      if (analyticsData.topContributors?.length > 0) {
        csvData.push(['Rank', 'Name', 'Memories', 'Likes']);
        analyticsData.topContributors.forEach((contributor, index) => {
          csvData.push([index + 1, contributor.name, contributor.memories, contributor.likes]);
        });
        csvData.push([]);
      }
      
      // Popular tags
      if (analyticsData.popularTags?.length > 0) {
        csvData.push(['Tag', 'Count', 'Growth']);
        analyticsData.popularTags.forEach(tag => {
          csvData.push([tag.tag, tag.count, tag.growth]);
        });
        csvData.push([]);
      }
      
      // Device usage
      if (analyticsData.deviceBreakdown?.length > 0) {
        csvData.push(['Device', 'Count', 'Percentage']);
        analyticsData.deviceBreakdown.forEach(device => {
          csvData.push([device.device, device.count, device.percentage]);
        });
      }
      
      // Convert to CSV string
      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `zynk-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV report. Please try again.');
    }
  };

  const exportToExcel = () => {
    try {
      // Create a simple HTML table that can be opened in Excel
      let htmlContent = `
        <html>
        <head>
          <meta charset="utf-8">
          <title>Zynk Analytics Report</title>
        </head>
        <body>
          <h1>Zynk Analytics Report</h1>
          <p><strong>Report Period:</strong> ${filters.dateRange.replace('last', 'Last ').replace('days', ' Days').replace('year', 'Year')}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>Summary Statistics</h2>
          <table border="1">
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Memories</td><td>${analyticsData.totalMemories?.toLocaleString() || '0'}</td></tr>
            <tr><td>Total Contributors</td><td>${analyticsData.totalContributors?.toLocaleString() || '0'}</td></tr>
            <tr><td>Engagement Rate</td><td>${analyticsData.engagementRate || 0}%</td></tr>
            <tr><td>Total Views</td><td>${analyticsData.totalViews?.toLocaleString() || '0'}</td></tr>
            <tr><td>Total Likes</td><td>${analyticsData.totalLikes?.toLocaleString() || '0'}</td></tr>
            <tr><td>Total Comments</td><td>${analyticsData.totalComments?.toLocaleString() || '0'}</td></tr>
            <tr><td>Total Shares</td><td>${analyticsData.totalShares?.toLocaleString() || '0'}</td></tr>
          </table>
      `;
      
      // Add category breakdown
      if (analyticsData.categoryBreakdown?.length > 0) {
        htmlContent += `
          <h2>Category Breakdown</h2>
          <table border="1">
            <tr><th>Category</th><th>Count</th><th>Percentage</th></tr>
        `;
        analyticsData.categoryBreakdown.forEach(cat => {
          htmlContent += `<tr><td>${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</td><td>${cat.count.toLocaleString()}</td><td>${cat.percentage}%</td></tr>`;
        });
        htmlContent += '</table>';
      }
      
      // Add top contributors
      if (analyticsData.topContributors?.length > 0) {
        htmlContent += `
          <h2>Top Contributors</h2>
          <table border="1">
            <tr><th>Rank</th><th>Name</th><th>Memories</th><th>Likes</th></tr>
        `;
        analyticsData.topContributors.forEach((contributor, index) => {
          htmlContent += `<tr><td>#${index + 1}</td><td>${contributor.name}</td><td>${contributor.memories}</td><td>${contributor.likes}</td></tr>`;
        });
        htmlContent += '</table>';
      }
      
      // Add popular tags
      if (analyticsData.popularTags?.length > 0) {
        htmlContent += `
          <h2>Popular Tags</h2>
          <table border="1">
            <tr><th>Tag</th><th>Count</th><th>Growth</th></tr>
        `;
        analyticsData.popularTags.forEach(tag => {
          htmlContent += `<tr><td>${tag.tag}</td><td>${tag.count}</td><td>${tag.growth}</td></tr>`;
        });
        htmlContent += '</table>';
      }
      
      // Add device usage
      if (analyticsData.deviceBreakdown?.length > 0) {
        htmlContent += `
          <h2>Device Usage</h2>
          <table border="1">
            <tr><th>Device</th><th>Count</th><th>Percentage</th></tr>
        `;
        analyticsData.deviceBreakdown.forEach(device => {
          htmlContent += `<tr><td>${device.device}</td><td>${device.count}</td><td>${device.percentage}%</td></tr>`;
        });
        htmlContent += '</table>';
      }
      
      htmlContent += '</body></html>';
      
      // Create and download file
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `zynk-analytics-report-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel report. Please try again.');
    }
  };

  const engagementData = [
    { name: "Views", value: analyticsData.totalViews || 0 },
    { name: "Likes", value: analyticsData.totalLikes || 0 },
    {name: "Comments", value: analyticsData.totalComments || 0,},
    { name: "Shares", value: analyticsData.totalShares || 0 },
  ];

  return (
    <div className="analytics-filter">
      <Navbar />
      <div className="container">
        <header className="page-header">
          <Link to="/analytics" className="back-btn">
            ← Back to Analytics
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

        {/* Export Options */}
        <div className="export-section">
          <h3>📊 Export Analytics Report</h3>
          <p>Download comprehensive analytics data in your preferred format</p>
          <div className="export-buttons">
            <button 
              onClick={exportToPDF} 
              disabled={exportLoading}
              className="export-btn pdf-btn"
            >
              {exportLoading ? '⏳' : '📄'} PDF Report
            </button>
            <button 
              onClick={exportToCSV} 
              className="export-btn csv-btn"
            >
              📊 CSV Data
            </button>
            <button 
              onClick={exportToExcel} 
              className="export-btn excel-btn"
            >
              📈 Excel Report
            </button>
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
                    <Bar dataKey="value" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-container">
                <h3>Daily Activity Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.dailyActivity?.slice(-7) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="memories" fill="#666666" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="analytics-sections">
              <div className="section">
                <h3>Top Contributors</h3>
                <div className="contributors-list">
                  {analyticsData.topContributors?.map((contributor, index) => (
                    <div key={index} className="contributor-item">
                      <div className="contributor-avatar">{contributor.avatar}</div>
                      <div className="contributor-info">
                        <h4>{contributor.name}</h4>
                        <p>{contributor.memories} memories • {contributor.likes} likes</p>
                      </div>
                      <div className="contributor-rank">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Popular Tags</h3>
                <div className="tags-grid">
                  {analyticsData.popularTags?.map((tag, index) => (
                    <div key={index} className="tag-item">
                      <span className="tag-name">{tag.tag}</span>
                      <span className="tag-count">{tag.count}</span>
                      <span className="tag-growth">{tag.growth}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Device Usage</h3>
                <div className="device-stats">
                  {analyticsData.deviceBreakdown?.map((device, index) => (
                    <div key={index} className="device-item">
                      <div className="device-info">
                        <span className="device-name">{device.device}</span>
                        <span className="device-count">{device.count} memories</span>
                      </div>
                      <div className="device-bar">
                        <div 
                          className="device-fill" 
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <span className="device-percentage">{device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Peak Activity Hours</h3>
                <div className="time-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.timeDistribution?.filter((_, i) => i % 2 === 0) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="memories" fill="#000000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                      Most activity occurs between 8-10 PM with {analyticsData.timeDistribution?.[20]?.memories || 134} memories at peak hour
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">📈</div>
                  <div className="insight-content">
                    <h4>Top Category</h4>
                    <p>
                      {analyticsData.categoryBreakdown?.[0]?.category || 'Highlights'} leads with {analyticsData.categoryBreakdown?.[0]?.percentage || 31.3}% of all memories
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">👥</div>
                  <div className="insight-content">
                    <h4>Active Contributors</h4>
                    <p>
                      {analyticsData.totalContributors || 156} contributors with {analyticsData.topContributors?.[0]?.name || 'Sarah Johnson'} leading at {analyticsData.topContributors?.[0]?.memories || 89} memories
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">📱</div>
                  <div className="insight-content">
                    <h4>Mobile Dominance</h4>
                    <p>
                      {analyticsData.deviceBreakdown?.[0]?.percentage || 68.5}% of memories created on mobile devices
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">❤️</div>
                  <div className="insight-content">
                    <h4>Engagement Rate</h4>
                    <p>
                      {analyticsData.engagementRate || 87.3}% engagement rate with {analyticsData.totalLikes || 8924} total likes
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">🏷️</div>
                  <div className="insight-content">
                    <h4>Popular Tags</h4>
                    <p>
                      #{analyticsData.popularTags?.[0]?.tag?.replace('#', '') || 'wedding'} is trending with {analyticsData.popularTags?.[0]?.count || 234} uses
                    </p>
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

