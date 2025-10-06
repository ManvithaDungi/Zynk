import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">Zynk</div>

        <div className="sidebar-date">
          <div className="big-date">{day}</div>
          <div className="month-year">
            {month} {year}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/calendar" className="nav-link">
            Calendar
          </NavLink>
          <NavLink to="/add-event" className="nav-link">
            Timeline
          </NavLink>
          <NavLink to="/timeline" className="nav-link">
            New Event
          </NavLink>
          <NavLink to="/history" className="nav-link">
            History
          </NavLink>
          <NavLink to="/events" className="nav-link">
            Events
          </NavLink>
          <NavLink to="/analysis" className="nav-link">
            Analysis
          </NavLink>
        </nav>
      </div>

      <footer className="sidebar-footer">© Zynk</footer>
    </aside>
  );
}

export default Sidebar;
