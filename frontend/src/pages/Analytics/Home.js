import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";

const AnalyticsHome = () => {
  const modules = [
    {
      id: "bulk-categorize",
      title: "Bulk Categorize & Tag",
      description: "Organize memories by assigning categories and tags in bulk",
      icon: "🏷️",
      path: "/bulk-categorize",
    },
    {
      id: "privacy-manager",
      title: "Privacy & Visibility",
      description: "Control who can see specific memories and content",
      icon: "🛡️",
      path: "/privacy-manager",
    },
    {
      id: "analytics-filter",
      title: "Analytics Dashboard",
      description: "View detailed insights and trends from your event data",
      icon: "📊",
      path: "/analytics-filter",
    },
  ];

  return (
    <div className="analytics-page">
      <Navbar />
      
      <div className="analytics-container">
        <header className="analytics-header">
          <h1>Post-Event Analytics</h1>
          <p>Manage, analyze, and organize your event memories with powerful tools</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>1,247</h3>
              <p>Total Memories</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>342</h3>
              <p>Contributors</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-content">
              <h3>28</h3>
              <p>Categories</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>156</h3>
              <p>Tags Used</p>
            </div>
          </div>
        </div>

        <div className="modules-grid">
          {modules.map((module) => (
            <Link key={module.id} to={module.path} className="module-card">
              <div className="module-icon">{module.icon}</div>
              <div className="module-content">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <div className="module-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHome;
