import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Analysis.css";

const API = process.env.REACT_APP_API || "http://localhost:5000/api";

export default function Analysis() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");

  const COLORS = [
    "#FF7F50", "#FFB6C1", "#FFA07A", "#FFD700",
    "#87CEFA", "#98FB98", "#E6E6FA",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API}/events`);
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // --- Group by month and week ---
  const groupByMonth = () => {
    const data = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      const month = d.toLocaleString("default", { month: "short" });
      data[month] = (data[month] || 0) + 1;
    });
    return Object.entries(data).map(([month, count]) => ({ month, count }));
  };

  const groupByWeek = () => {
    const data = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      const week = `Week ${Math.ceil(d.getDate() / 7)}`;
      data[week] = (data[week] || 0) + 1;
    });
    return Object.entries(data).map(([week, count]) => ({ week, count }));
  };

  // --- Tag distribution ---
  const tagDistribution = () => {
    const tags = {};
    events.forEach((e) => {
      const tag = e.tag || "Uncategorized";
      tags[tag] = (tags[tag] || 0) + 1;
    });
    return Object.entries(tags).map(([name, value]) => ({ name, value }));
  };

  // --- Auto report ---
  const generateReport = () => {
    if (!events.length) return "No event data available to generate report.";
    const months = groupByMonth();
    const topMonth = months.reduce((a, b) => (a.count > b.count ? a : b));
    const total = events.length;
    const tags = tagDistribution();
    const topTag = tags.reduce((a, b) => (a.value > b.value ? a : b));

    return `A total of ${total} events were recorded. The month with the most activity was ${topMonth.month} with ${topMonth.count} events. 
    The most common tag among events was "${topTag.name}" indicating strong focus on that category. 
    Overall, event distribution remained consistent across the year with slight increases during active periods. 
    These insights highlight engagement patterns useful for future planning and scheduling.`;
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <h2 className="analysis-title">Event Analysis Dashboard</h2>

        <div className="view-toggle">
          <button
            className={view === "month" ? "active" : ""}
            onClick={() => setView("month")}
          >
            Month View
          </button>
          <button
            className={view === "week" ? "active" : ""}
            onClick={() => setView("week")}
          >
            Week View
          </button>
        </div>

        <div className="analysis-charts">
          <div className="chart-card">
            <h3>Events per {view === "month" ? "Month" : "Week"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={view === "month" ? groupByMonth() : groupByWeek()}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={view === "month" ? "month" : "week"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF7F50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Tag Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tagDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#FF7F50"
                  dataKey="value"
                  nameKey="name"
                >
                  {tagDistribution().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Monthly Event Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={groupByMonth()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF7F50"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-section">
          <h3>Event Summary Report</h3>
          <p>{generateReport()}</p>
        </div>
      </div>
    </div>
  );
}
