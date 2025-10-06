import { Link } from "react-router-dom"
import "./HomePage.css"

const HomePage = () => {
  const modules = [
    {
      id: "bulk-categorize",
      title: "Bulk Categorize & Tag",
      description: "Organize memories by assigning categories and tags in bulk",
      icon: "🏷️",
      color: "#2563eb", // Blue theme
      path: "/bulk-categorize",
    },
    {
      id: "privacy-manager",
      title: "Privacy & Visibility",
      description: "Control who can see specific memories and content",
      icon: "🛡️",
      color: "#1e40af", // Darker blue
      path: "/privacy-manager",
    },
    {
      id: "analytics-filter",
      title: "Analytics Dashboard",
      description: "View detailed insights and trends from your event data",
      icon: "📊",
      color: "#3b82f6", // Medium blue
      path: "/analytics-filter",
    },
  ]

  return (
    <div className="homepage">
      <div className="container">
        <header className="homepage-header">
          <h1>Post-Event Memories & Analytics</h1>
          <p>Manage, analyze, and export your event memories with powerful tools</p>
          <div className="event-badge">Event ID: event-123</div>
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
              <h3>89</h3>
              <p>Contributors</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>94%</h3>
              <p>Engagement Rate</p>
            </div>
          </div>
        </div>

        <div className="modules-grid">
          {modules.map((module) => (
            <Link key={module.id} to={module.path} className="module-card">
              <div className="module-icon" style={{ backgroundColor: module.color }}>
                {module.icon}
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div className="module-arrow">→</div>
            </Link>
          ))}
        </div>

        <footer className="homepage-footer">
          <p>Social Timeline App - Post-Event Management System</p>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
