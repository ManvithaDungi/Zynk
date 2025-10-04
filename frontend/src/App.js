import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import "./App.css";

// Lazy load components
const Login = lazy(() => import("./pages/Login/Login"));
const Home = lazy(() => import("./pages/Home/Home"));
const UpcomingEvents = lazy(() => import("./pages/UpcomingEvents/UpcomingEvents"));
const CreateEvent = lazy(() => import("./pages/CreateEvent/CreateEvent"));
const EventDetail = lazy(() => import("./pages/EventDetail/EventDetail"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const Albums = lazy(() => import("./pages/Albums/Albums"));

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading user session...</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading page...</p>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/upcoming-events" element={<PrivateRoute><UpcomingEvents /></PrivateRoute>} />
        <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
        <Route path="/event/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/albums" element={<PrivateRoute><Albums /></PrivateRoute>} />

        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        {/* Catch-all route for 404 - redirects to home or login */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="app">
            <AppRoutes />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;