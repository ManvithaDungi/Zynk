"use client"

import { useState } from "react"
import axios from "axios"
import "./MemoryViewer.css"

const MemoryViewer = ({ album, onBack, isRegistered }) => {
  const [memories, setMemories] = useState(album.memories || [])
  // Remove unused loading state to satisfy no-unused-vars
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "image",
  })

  const handleAddMemory = async (e) => {
    e.preventDefault()

    if (!newMemory.title.trim() || !newMemory.mediaUrl.trim()) {
      alert("Title and media URL are required")
      return
    }

    try {
      setAdding(true)
      const response = await axios.post("/api/memories", {
        ...newMemory,
        albumId: album.id,
      })

      setMemories((prev) => [response.data.memory, ...prev])
      setNewMemory({ title: "", description: "", mediaUrl: "", mediaType: "image" })
      setShowAddForm(false)
      alert("Memory added successfully!")
    } catch (error) {
      console.error("Add memory error:", error)
      alert(error.response?.data?.message || "Failed to add memory")
    } finally {
      setAdding(false)
    }
  }

  const handleLikeMemory = async (memoryId) => {
    try {
      const response = await axios.post(`/api/memories/${memoryId}/like`)

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                likesCount: response.data.likesCount,
                isLikedByUser: response.data.isLiked,
              }
            : memory,
        ),
      )
    } catch (error) {
      console.error("Like memory error:", error)
      alert("Failed to like memory")
    }
  }

  const handleAddComment = async (memoryId, commentText) => {
    if (!commentText.trim()) return

    try {
      const response = await axios.post(`/api/memories/${memoryId}/comment`, {
        text: commentText,
      })

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                comments: [...(memory.comments || []), response.data.comment],
                commentsCount: response.data.commentsCount,
              }
            : memory,
        ),
      )
    } catch (error) {
      console.error("Add comment error:", error)
      alert("Failed to add comment")
    }
  }

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) {
      return
    }

    try {
      await axios.delete(`/api/memories/${memoryId}`)
      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId))
      alert("Memory deleted successfully!")
    } catch (error) {
      console.error("Delete memory error:", error)
      alert(error.response?.data?.message || "Failed to delete memory")
    }
  }

  return (
    <div className="memory-viewer">
      <div className="memory-viewer-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Albums
        </button>

        <div className="album-info">
          <h2>{album.title}</h2>
          {album.description && <p>{album.description}</p>}
        </div>

        {isRegistered && (
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            Add Memory
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-memory-modal">
          <div className="add-memory-form">
            <h3>Add New Memory</h3>
            <form onSubmit={handleAddMemory}>
              <div className="form-group">
                <label htmlFor="memoryTitle">Title *</label>
                <input
                  type="text"
                  id="memoryTitle"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter memory title"
                  required
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="memoryDescription">Description</label>
                <textarea
                  id="memoryDescription"
                  value={newMemory.description}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this memory"
                  rows="3"
                  maxLength="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mediaType">Media Type *</label>
                <select
                  id="mediaType"
                  value={newMemory.mediaType}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, mediaType: e.target.value }))}
                  required
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mediaUrl">Media URL *</label>
                <input
                  type="url"
                  id="mediaUrl"
                  value={newMemory.mediaUrl}
                  onChange={(e) => setNewMemory((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={adding} className="btn btn-primary">
                  {adding ? "Adding..." : "Add Memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="memories-grid">
        {memories.length === 0 ? (
          <div className="empty-memories">
            <p>No memories in this album yet.</p>
            {isRegistered && <p>Be the first to add a memory!</p>}
          </div>
        ) : (
          memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onLike={handleLikeMemory}
              onAddComment={handleAddComment}
              onDelete={handleDeleteMemory}
              canDelete={memory.createdBy._id === localStorage.getItem("userId")}
            />
          ))
        )}
      </div>
    </div>
  )
}

const MemoryCard = ({ memory, onLike, onAddComment, onDelete, canDelete }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")

  const handleSubmitComment = (e) => {
    e.preventDefault()
    onAddComment(memory.id, commentText)
    setCommentText("")
  }

  return (
    <div className="memory-card">
      <div className="memory-media">
        {memory.mediaType === "image" ? (
          <img src={memory.mediaUrl || "/placeholder.svg"} alt={memory.title} />
        ) : (
          <video controls>
            <source src={memory.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="memory-content">
        <h4>{memory.title}</h4>
        {memory.description && <p className="memory-description">{memory.description}</p>}

        <div className="memory-meta">
          <span className="memory-author">by {memory.createdBy.name}</span>
          <span className="memory-date">{new Date(memory.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="memory-actions">
          <button onClick={() => onLike(memory.id)} className={`like-btn ${memory.isLikedByUser ? "liked" : ""}`}>
            ❤️ {memory.likesCount}
          </button>

          <button onClick={() => setShowComments(!showComments)} className="comment-btn">
            💬 {memory.commentsCount}
          </button>

          {canDelete && (
            <button onClick={() => onDelete(memory.id)} className="delete-btn">
              🗑️
            </button>
          )}
        </div>

        {showComments && (
          <div className="comments-section">
            <div className="comments-list">
              {memory.comments &&
                memory.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.user.name}:</strong> {comment.text}
                    <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
            </div>

            <form onSubmit={handleSubmitComment} className="comment-form">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                maxLength="500"
              />
              <button type="submit" disabled={!commentText.trim()}>
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemoryViewer
