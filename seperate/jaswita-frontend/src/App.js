import React, { Component } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage"
import LandingPage from "./components/LandingPage"
import BulkCategorizeForm from "./components/BulkCategorizeForm"
import PrivacyManager from "./components/PrivacyManager"
import AnalyticsFilter from "./components/AnalyticsFilter"
import "./App.css"

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home-page" element={<HomePage />} />
            <Route path="/bulk-categorize" element={<BulkCategorizeForm />} />
            <Route path="/privacy-manager" element={<PrivacyManager />} />
            <Route path="/analytics-filter" element={<AnalyticsFilter />} />
          </Routes>
        </div>
      </Router>
    )
  }
}

export default App
