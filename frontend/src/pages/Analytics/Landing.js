import React, { useState } from 'react';
import './Landing.css';
import AnalyticsHome from './Home'
import { Camera, Calendar, Users, BarChart3, Sparkles, Zap, ArrowRight, Play, Moon, Sun } from 'lucide-react';

const Landing = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const forms = [
    {
      id: 'media',
      title: 'Media Studio',
      description: 'Capture and create stunning visual content',
      icon: Camera,
      gradientClass: 'gradient-media',
      color: 'media'
    },
    {
      id: 'timeline',
      title: 'Event Timeline',
      description: 'Organize and showcase your moments',
      icon: Calendar,
      gradientClass: 'gradient-timeline',
      color: 'timeline'
    },
    {
      id: 'collaboration',
      title: 'Team Space',
      description: 'Connect and collaborate in real-time',
      icon: Users,
      gradientClass: 'gradient-collaboration',
      color: 'collaboration'
    },
    {
      id: 'analytics',
      title: 'Performance Hub',
      description: 'Track engagement and insights',
      icon: BarChart3,
      gradientClass: 'gradient-analytics',
      color: 'analytics'
    }
  ];

  const handleFormOpen = (formId) => {
    setActiveForm(formId);
  };

  return (
    <div className={`zynk-homepage ${darkMode ? 'dark-mode' : ''}`}>
      {activeForm === 'analytics' ? (
        <div className="form-container">
          <button 
            onClick={() => setActiveForm(null)} 
            className="back-button"
          >
            <ArrowRight className="back-icon" />
            Back to Home
          </button>
          <AnalyticsHome/>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-background">
              <div className="floating-orb orb-1"></div>
              <div className="floating-orb orb-2"></div>
              <div className="floating-orb orb-3"></div>
              <div className="floating-orb orb-4"></div>
            </div>
            
            <div className="hero-content">
              <div className="brand-container">
                <div className="logo-wrapper">
                  <Zap className="logo-icon" />
                  <div className="logo-glow"></div>
                </div>
                <h1 className="hero-title">Zynk</h1>
                <div className="title-underline"></div>
              </div>
              
              <p className="hero-subtitle">
                The future of creative collaboration starts here
              </p>

              {/* Dark Mode Toggle */}
              <button 
                className="dark-toggle"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="toggle-icon" /> : <Moon className="toggle-icon" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="content-header">
              <h2 className="section-title">Choose Your Workspace</h2>
              <p className="section-subtitle">
                Select a module and unlock powerful creative tools
              </p>
            </div>

            {/* Cards Grid */}
            <div className="workspace-grid">
              {forms.map((form, index) => {
                const IconComponent = form.icon;
                return (
                  <div
                    key={form.id}
                    className={`workspace-card ${hoveredCard === form.id ? 'hovered' : ''}`}
                    onClick={() => handleFormOpen(form.id)}
                    onMouseEnter={() => setHoveredCard(form.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{ '--delay': `${index * 100}ms` }}
                  >
                    <div className={`card-glow ${form.gradientClass}`}></div>
                    <div className="card-content">
                      <div className="card-header">
                        <div className={`icon-container ${form.gradientClass}`}>
                          <IconComponent className="card-icon" />
                          <div className="icon-glow"></div>
                        </div>
                        <div className="card-info">
                          <h3 className="card-title">{form.title}</h3>
                        </div>
                      </div>
                      
                      <p className="card-description">{form.description}</p>
                    
                      <div className="card-footer">
                        <button className={`launch-button ${form.gradientClass}`}>
                          <Play className="launch-icon" />
                          Launch
                        </button>
                        <div className="card-indicator">
                          <ArrowRight className="indicator-icon" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-shine"></div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="cta-section">
              <div className="cta-content">
                <div className="cta-icon">
                  <Sparkles className="sparkle-icon" />
                </div>
                <h3 className="cta-title">Ready to create something amazing?</h3>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Landing;
