"use client"

import React, { Component } from "react"
import { Link } from "react-router-dom"
import "./PrivacyManager.css"

class PrivacyManager extends Component {
  constructor(props) {
    super(props)
    this.state = {
      memories: [],
      selectedMemories: [],
      privacySettings: {
        visibility: "public",
        allowedUsers: [],
        allowedGroups: [],
        downloadable: true,
        shareable: true,
      },
      users: [],
      groups: [],
      loading: false,
      fetchingData: true,
    }
  }

  componentDidMount() {
    this.fetchAllData()
  }

  fetchAllData = async () => {
    this.setState({ fetchingData: true })
    try {
      await Promise.all([this.fetchMemories(), this.fetchUsers(), this.fetchGroups()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      this.setState({ fetchingData: false })
    }
  }

  fetchMemories = async () => {
    try {
      const response = await fetch("/api/privacyManager/memories")
      const data = await response.json()
      if (Array.isArray(data)) {
        this.setState({ memories: data })
      } else if (data && Array.isArray(data.memories)) {
        this.setState({ memories: data.memories })
      } else {
        this.setState({ memories: [] })
      }
    } catch (error) {
      console.error("Error fetching memories:", error)
      this.setState({ memories: [] })
    }
  }

  fetchUsers = async () => {
    try {
      const response = await fetch("/api/privacyManager/users")
      const data = await response.json()
      this.setState({ users: Array.isArray(data) ? data : [] })
    } catch (error) {
      console.error("Error fetching users:", error)
      this.setState({ users: [] })
    }
  }

  fetchGroups = async () => {
    try {
      const response = await fetch("/api/privacyManager/groups")
      const data = await response.json()
      this.setState({ groups: Array.isArray(data) ? data : [] })
    } catch (error) {
      console.error("Error fetching groups:", error)
      this.setState({ groups: [] })
    }
  }

  handleMemorySelect = (memoryId) => {
    this.setState((prevState) => {
      const isSelected = prevState.selectedMemories.includes(memoryId)
      return {
        selectedMemories: isSelected
          ? prevState.selectedMemories.filter((id) => id !== memoryId)
          : [...prevState.selectedMemories, memoryId],
      }
    })
  }

  handleVisibilityChange = (visibility) => {
    this.setState((prevState) => ({
      privacySettings: {
        ...prevState.privacySettings,
        visibility,
        allowedUsers: visibility === "restricted" ? prevState.privacySettings.allowedUsers : [],
        allowedGroups: visibility === "restricted" ? prevState.privacySettings.allowedGroups : [],
      },
    }))
  }

  handleUserToggle = (userId) => {
    this.setState((prevState) => ({
      privacySettings: {
        ...prevState.privacySettings,
        allowedUsers: prevState.privacySettings.allowedUsers.includes(userId)
          ? prevState.privacySettings.allowedUsers.filter((id) => id !== userId)
          : [...prevState.privacySettings.allowedUsers, userId],
      },
    }))
  }

  handleGroupToggle = (groupId) => {
    this.setState((prevState) => ({
      privacySettings: {
        ...prevState.privacySettings,
        allowedGroups: prevState.privacySettings.allowedGroups.includes(groupId)
          ? prevState.privacySettings.allowedGroups.filter((id) => id !== groupId)
          : [...prevState.privacySettings.allowedGroups, groupId],
      },
    }))
  }

  applyPrivacySettings = async () => {
    const { selectedMemories, privacySettings } = this.state
    if (selectedMemories.length === 0) {
      alert("Please select at least one memory")
      return
    }

    this.setState({ loading: true })
    try {
      const response = await fetch("/api/privacyManager/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryIds: selectedMemories,
          privacySettings: {
            visibility: privacySettings.visibility,
            allowedUsers: privacySettings.allowedUsers,
            allowedGroups: privacySettings.allowedGroups,
            settings: {
              allowDownload: privacySettings.downloadable,
              allowSharing: privacySettings.shareable,
              allowComments: true,
            },
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response:", errorText)
        throw new Error("Failed to update privacy settings")
      }

      await response.json()
      alert(`Privacy settings updated for ${selectedMemories.length} memories!`)

      await this.fetchMemories()
      this.setState({
        selectedMemories: [],
        privacySettings: {
          visibility: "public",
          allowedUsers: [],
          allowedGroups: [],
          downloadable: true,
          shareable: true,
        },
      })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      alert("Network error: Could not update privacy settings")
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const { memories, selectedMemories, privacySettings, users, groups, loading, fetchingData } = this.state

    return (
      <div className="privacy-manager">
        <div className="container">
          <header className="page-header">
            <Link to="/home-page" className="back-btn">
              ← Back to Dashboard
            </Link>
            <div className="header-content">
              <div className="header-icon">🛡️</div>
              <h1>Privacy & Visibility Manager</h1>
              <p>Control who can see specific memories and content</p>
            </div>
          </header>

          <div className="privacy-content">
            <div className="memories-section">
              <h3>Select Memories ({selectedMemories.length} selected)</h3>
              {fetchingData ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading data...</p>
                </div>
              ) : memories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛡️</div>
                  <p>No memories available</p>
                  <button onClick={this.fetchAllData} className="btn btn-primary">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="memories-grid">
                  {memories.map((memory) => (
                    <div
                      key={memory._id}
                      className={`memory-item ${selectedMemories.includes(memory._id) ? "selected" : ""}`}
                      onClick={() => this.handleMemorySelect(memory._id)}
                    >
                      <div className="memory-checkbox">{selectedMemories.includes(memory._id) && "✓"}</div>
                      <img src={memory.imageUrl || "/placeholder.svg"} alt={memory.title} />
                      <div className="memory-info">
                        <h4>{memory.title}</h4>
                        <div className="current-privacy">
                          <span className={`privacy-badge ${memory.visibility}`}>{memory.visibility}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="privacy-settings-section">
              <h3>Privacy Settings</h3>

              <div className="setting-group">
                <h4>Visibility Level</h4>
                <div className="radio-group">
                  {["public", "private", "restricted"].map((level) => (
                    <label key={level} className="radio-option">
                      <input
                        type="radio"
                        name="visibility"
                        value={level}
                        checked={privacySettings.visibility === level}
                        onChange={() => this.handleVisibilityChange(level)}
                      />
                      <span className="radio-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                      <span className="radio-description">
                        {level === "public" && "Visible to everyone"}
                        {level === "private" && "Only visible to you"}
                        {level === "restricted" && "Visible to selected users/groups"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {privacySettings.visibility === "restricted" && (
                <>
                  <div className="setting-group">
                    <h4>Allowed Users</h4>
                    <div className="checkbox-group">
                      {users.map((user) => (
                        <label key={user._id} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowedUsers.includes(user._id)}
                            onChange={() => this.handleUserToggle(user._id)}
                          />
                          <span>
                            {user.name} ({user.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="setting-group">
                    <h4>Allowed Groups</h4>
                    <div className="checkbox-group">
                      {groups.map((group) => (
                        <label key={group._id} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowedGroups.includes(group._id)}
                            onChange={() => this.handleGroupToggle(group._id)}
                          />
                          <span>
                            {group.name} ({group.memberCount} members)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="setting-group">
                <h4>Additional Permissions</h4>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={privacySettings.downloadable}
                      onChange={(e) =>
                        this.setState((prevState) => ({
                          privacySettings: { ...prevState.privacySettings, downloadable: e.target.checked },
                        }))
                      }
                    />
                    <span>Allow downloads</span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareable}
                      onChange={(e) =>
                        this.setState((prevState) => ({
                          privacySettings: { ...prevState.privacySettings, shareable: e.target.checked },
                        }))
                      }
                    />
                    <span>Allow sharing</span>
                  </label>
                </div>
              </div>

              <div className="action-section">
                <button
                  onClick={this.applyPrivacySettings}
                  className="btn btn-primary"
                  disabled={loading || selectedMemories.length === 0}
                >
                  {loading ? "Updating..." : `Apply Settings to ${selectedMemories.length} Memories`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PrivacyManager
