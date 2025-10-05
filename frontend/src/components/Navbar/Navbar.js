import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const isActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          <h1>Zynk</h1>
        </Link>

        <div className="navbar-menu">
          <Link 
            to="/upcoming-events" 
            className={`navbar-link ${isActive("/upcoming-events") ? "active" : ""}`}
          >
            Upcoming Events
          </Link>

          <Link 
            to="/albums" 
            className={`navbar-link ${isActive("/albums") ? "active" : ""}`}
          >
            Albums
          </Link>

          <Link 
            to="/privacy-manager" 
            className={`navbar-link ${isActive("/privacy-manager") ? "active" : ""}`}
          >
            Privacy
          </Link>

          <Link 
            to="/analytics" 
            className={`navbar-link ${location.pathname.startsWith("/analytics") || location.pathname === "/bulk-categorize" || location.pathname === "/analytics-filter" ? "active" : ""}`}
          >
            Analytics
          </Link>

          <Link 
            to="/create-event" 
            className={`navbar-link create-event-link ${isActive("/create-event") ? "active" : ""}`}
          >
            Create Event
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <button 
              onClick={handleLogout} 
              className="logout-btn" 
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;