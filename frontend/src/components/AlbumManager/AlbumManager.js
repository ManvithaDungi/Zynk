"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import "./AlbumManager.css"

const AlbumManager = ({ eventId, isRegistered, onAlbumSelect }) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: "",
    coverImage: "",
  })

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/albums/event/${eventId}`)
      setAlbums(response.data.albums)
    } catch (error) {
      console.error("Error fetching albums:", error)
      setError("Failed to load albums")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchAlbums()
    }
  }, [eventId, fetchAlbums])

  const handleCreateAlbum = async (e) => {
    e.preventDefault()

    if (!newAlbum.title.trim()) {
      alert("Album title is required")
      return
    }

    try {
      setCreating(true)
      const response = await axios.post("/api/albums", {
        ...newAlbum,
        eventId,
      })

      setAlbums((prev) => [response.data.album, ...prev])
      setNewAlbum({ title: "", description: "", coverImage: "" })
      setShowCreateForm(false)
      alert("Album created successfully!")
    } catch (error) {
      console.error("Create album error:", error)
      alert(error.response?.data?.message || "Failed to create album")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm("Are you sure you want to delete this album? All memories in it will be deleted.")) {
      return
    }

    try {
      await axios.delete(`/api/albums/${albumId}`)
      setAlbums((prev) => prev.filter((album) => album.id !== albumId))
      alert("Album deleted successfully!")
    } catch (error) {
      console.error("Delete album error:", error)
      alert(error.response?.data?.message || "Failed to delete album")
    }
  }

  if (loading) {
    return (
      <div className="album-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="album-manager">
      <div className="album-manager-header">
        <h3>Albums & Memories</h3>
        {isRegistered && (
          <button onClick={() => setShowCreateForm(true)} className="btn btn-primary btn-sm">
            Create Album
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAlbums} className="btn btn-secondary btn-sm">
            Try Again
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="create-album-modal">
          <div className="create-album-form">
            <h4>Create New Album</h4>
            <form onSubmit={handleCreateAlbum}>
              <div className="form-group">
                <label htmlFor="albumTitle">Album Title *</label>
                <input
                  type="text"
                  id="albumTitle"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter album title"
                  required
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="albumDescription">Description</label>
                <textarea
                  id="albumDescription"
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this album"
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div className="form-group">
                <label htmlFor="albumCover">Cover Image URL</label>
                <input
                  type="url"
                  id="albumCover"
                  value={newAlbum.coverImage}
                  onChange={(e) => setNewAlbum((prev) => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="albums-grid">
        {albums.length === 0 ? (
          <div className="empty-albums">
            <p>No albums created yet for this event.</p>
            {isRegistered && <p>Be the first to create an album and share memories!</p>}
          </div>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="album-card">
              <div className="album-cover">
                {album.coverImage ? (
                  <img src={album.coverImage || "/placeholder.svg"} alt={album.title} />
                ) : (
                  <div className="album-placeholder">📸</div>
                )}
              </div>

              <div className="album-info">
                <h4>{album.title}</h4>
                {album.description && <p className="album-description">{album.description}</p>}

                <div className="album-meta">
                  <span className="memory-count">
                    {album.memoriesCount} {album.memoriesCount === 1 ? "memory" : "memories"}
                  </span>
                  <span className="album-creator">by {album.createdBy.name}</span>
                </div>

                <div className="album-actions">
                  <button onClick={() => onAlbumSelect(album)} className="btn btn-primary btn-sm">
                    View Album
                  </button>
                  {album.createdBy._id === localStorage.getItem("userId") && (
                    <button onClick={() => handleDeleteAlbum(album.id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlbumManager
