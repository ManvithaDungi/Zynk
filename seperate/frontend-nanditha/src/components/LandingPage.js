import React, { useState } from "react";
import { Palette, CalendarDays, Users, BarChart3, Moon } from "lucide-react";

import MediaStudio from "./MediaStudio.js";      // friend’s module
import EventTimeline from "../pages/EventTimeline.js"; // your module
import TeamSpace from "./TeamSpace.js";          // placeholder or friend’s
import PerformanceHub from "./PerformanceHub.js"; // placeholder or friend’s

import "./LandingPage.css";

function LandingPage() {
  const [activeForm, setActiveForm] = useState(null);

  const cardConfigs = [
    {
      id: "studio",
      title: "Media Studio",
      subtitle: "Capture and create stunning visual content",
      icon: Palette,
      gradient: "from-purple-500 to-pink-500",
      component: MediaStudio,
    },
    {
      id: "timeline",
      title: "Event Timeline",
      subtitle: "Organize and showcase your moments",
      icon: CalendarDays,
      gradient: "from-orange-500 to-yellow-500",
      component: EventTimeline,
    },
    {
      id: "team",
      title: "Team Space",
      subtitle: "Connect and collaborate in real-time",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      component: TeamSpace,
    },
    {
      id: "hub",
      title: "Performance Hub",
      subtitle: "Track engagement and insights",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-500",
      component: PerformanceHub,
    },
  ];

  const renderForm = () => {
    const config = cardConfigs.find((c) => c.id === activeForm);
    if (!config) return null;
    const Component = config.component;
    return <Component />;
  };

  return (
    <div className="landing-page dark-mode">
      <header className="landing-header">
        <div className="header-top">
          <h1 className="landing-title">Zynk</h1>
          <button className="dark-mode-btn">
            <Moon className="icon" /> Dark Mode
          </button>
        </div>
        <p className="landing-subtitle">
          The future of creative collaboration starts here
        </p>
        <h2 className="workspace-heading">Choose Your Workspace</h2>
        <p className="workspace-subtitle">
          Select a module and unlock powerful creative tools
        </p>
      </header>

      <div className="cards-grid">
        {cardConfigs.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="card"
              onClick={() => setActiveForm(card.id)}
            >
              <div className="card-content">
                <div className="card-icon">
                  <Icon className="icon-inner" />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-subtitle">{card.subtitle}</p>
                <button className={`card-btn ${card.gradient}`}>
                  Launch
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="landing-footer">
        <p>Ready to create something amazing?</p>
      </footer>

      {/* Modal */}
      {activeForm && (
        <div className="modal-overlay" onClick={() => setActiveForm(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveForm(null)}
              className="modal-close"
            >
              ×
            </button>
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
