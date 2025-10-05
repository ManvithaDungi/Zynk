import { useState } from "react"
import Navbar from "../../components/Navbar/Navbar"
import CRUDForms from "../../components/CRUDForms/CRUDForms"
import AdminSettings from "./AdminSettings"
import "./Admin.css"

const Admin = () => {
  const [activeTab, setActiveTab] = useState("crud")

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-container">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all aspects of the Zynk application</p>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("crud")}
            className={`tab-btn ${activeTab === "crud" ? "active" : ""}`}
          >
            Content Management
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          >
            Site Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === "crud" && <CRUDForms />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  )
}

export default Admin
