"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import Home from "./pages/Home/Home"
import UpcomingEvents from "./pages/UpcomingEvents/UpcomingEvents"
import CreateEvent from "./pages/CreateEvent/CreateEvent"
import EventDetail from "./pages/EventDetail/EventDetail"
import Admin from "./pages/Admin/Admin"
import Albums from "./pages/Albums/Albums"
import { AuthProvider, useAuth } from "./context/AuthContext"
import "./App.css"

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/home" element={user ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/upcoming-events" element={user ? <UpcomingEvents /> : <Navigate to="/login" replace />} />
      <Route path="/create-event" element={user ? <CreateEvent /> : <Navigate to="/login" replace />} />
      <Route path="/event/:id" element={user ? <EventDetail /> : <Navigate to="/login" replace />} />
      <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" replace />} />
      <Route path="/albums" element={<Albums />} />
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      {/* Optional: Catch-all route for 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
