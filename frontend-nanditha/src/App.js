// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import EventTimeline from "./pages/EventTimeline"; // Add Event page
import TimelinePage from "./pages/TimelinePage";   // Calendar page
import History from "./pages/History";
import Sidebar from "./components/Sidebar";
import Tp from "./pages/Tp";                        // Timeline (horizontal)
import Analysis from "./pages/Analysis";            // Analysis page

// ✅ Sidebar layout wrapper
function SidebarLayout({ children }) {
  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Landing Page (no sidebar) */}
        <Route path="/" element={<LandingPage />} />

        {/* 🗓️ Calendar Page */}
        <Route
          path="/calendar"
          element={
            <SidebarLayout>
              <TimelinePage />
            </SidebarLayout>
          }
        />

        {/* ✍️ Add Event Page (CREATE EVENT form) */}
        <Route
          path="/add-event"
          element={
            <SidebarLayout>
              <EventTimeline />
            </SidebarLayout>
          }
        />

        {/* 🧭 Timeline (Horizontal View — currently placeholder) */}
        <Route
          path="/timeline"
          element={
            <SidebarLayout>
              <Tp />
            </SidebarLayout>
          }
        />

        {/* 🕰️ History Page */}
        <Route
          path="/history"
          element={
            <SidebarLayout>
              <History />
            </SidebarLayout>
          }
        />

        {/* 📊 Analysis Page */}
        <Route
          path="/analysis"
          element={
            <SidebarLayout>
              <Analysis />
            </SidebarLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
