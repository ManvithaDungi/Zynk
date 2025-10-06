"use client"

import React, { Component } from "react"
import { Link } from "react-router-dom"
import "./BulkCategorizeForm.css"

class BulkCategorizeForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      memories: [],
      selectedMemories: [],
      categories: ["highlights", "candid", "group", "photos", "videos", "testimonials"],
      tags: ["fun", "memorable", "beautiful", "exciting", "emotional"],
      selectedCategory: "",
      selectedTags: [],
      newCategory: "",
      newTag: "",
      loading: false,
      fetchingMemories: true,
      newMemory: {
        title: "",
        description: "",
        author: "",
        imageUrl: "",
        category: "",
        tags: [],
      },
      newMemoryTagInput: "",
    }
  }

  componentDidMount() {
    this.fetchMemories()
  }

  fetchMemories = async () => {
    try {
      this.setState({ fetchingMemories: true })
      const response = await fetch("/api/bulkcategorize/memories")
      const data = await response.json()
      if (Array.isArray(data)) this.setState({ memories: data })
      else if (data && Array.isArray(data.memories)) this.setState({ memories: data.memories })
      else if (data && Array.isArray(data.data)) this.setState({ memories: data.data })
      else this.setState({ memories: [] })
    } catch (error) {
      console.error("Error fetching memories:", error)
      this.setState({ memories: [] })
    } finally {
      this.setState({ fetchingMemories: false })
    }
  }

  handleMemorySelect = (memoryId) => {
    this.setState((prevState) => ({
      selectedMemories: prevState.selectedMemories.includes(memoryId)
        ? prevState.selectedMemories.filter((id) => id !== memoryId)
        : [...prevState.selectedMemories, memoryId],
    }))
  }

  handleSelectAll = () => {
    this.setState((prevState) => ({
      selectedMemories: prevState.memories.map((memory) => memory._id),
    }))
  }

  handleDeselectAll = () => {
    this.setState({ selectedMemories: [] })
  }

  handleTagToggle = (tag) => {
    this.setState((prevState) => ({
      selectedTags: prevState.selectedTags.includes(tag)
        ? prevState.selectedTags.filter((t) => t !== tag)
        : [...prevState.selectedTags, tag],
    }))
  }

  handleNewMemoryInputChange = (e) => {
    const { name, value } = e.target
    this.setState((prevState) => ({
      newMemory: { ...prevState.newMemory, [name]: value },
    }))
  }

  handleAddNewMemoryTag = () => {
    const { newMemory, newMemoryTagInput } = this.state
    const tag = newMemoryTagInput.trim()
    if (tag && !newMemory.tags.includes(tag)) {
      this.setState({
        newMemory: { ...newMemory, tags: [...newMemory.tags, tag] },
        newMemoryTagInput: "",
      })
    }
  }

  handleRemoveNewMemoryTag = (tag) => {
    this.setState((prevState) => ({
      newMemory: { ...prevState.newMemory, tags: prevState.newMemory.tags.filter((t) => t !== tag) },
    }))
  }

  handleCreateMemory = async () => {
    const { newMemory } = this.state
    if (!newMemory.title || !newMemory.description || !newMemory.author) {
      alert("Title, description, and author are required")
      return
    }
    try {
      const response = await fetch("/api/bulkcategorize/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemory),
      })
      if (response.ok) {
        alert("Memory created successfully")
        this.setState({
          newMemory: { title: "", description: "", author: "", imageUrl: "", category: "", tags: [] },
        })
        await this.fetchMemories()
      } else alert("Failed to create memory")
    } catch (error) {
      console.error("Error creating memory:", error)
      alert("Error creating memory")
    }
  }

  handleDeleteMemory = async (memoryId, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this memory?")) return
    try {
      const response = await fetch(`/api/bulkcategorize/delete/${memoryId}`, { method: "DELETE" })
      if (response.ok) {
        alert("Memory deleted successfully")
        this.setState((prevState) => ({
          memories: prevState.memories.filter((memory) => memory._id !== memoryId),
          selectedMemories: prevState.selectedMemories.filter((id) => id !== memoryId),
        }))
      } else alert("Failed to delete memory")
    } catch (error) {
      console.error("Error deleting memory:", error)
      alert("Error deleting memory")
    }
  }

  addNewCategory = () => {
    const { newCategory, categories } = this.state
    if (newCategory && !categories.includes(newCategory)) {
      this.setState({ categories: [...categories, newCategory], newCategory: "" })
    }
  }

  addNewTag = () => {
    const { newTag, tags } = this.state
    if (newTag && !tags.includes(newTag)) this.setState({ tags: [...tags, newTag], newTag: "" })
  }

  handleBulkCategorize = async () => {
    const { selectedMemories, selectedCategory, selectedTags } = this.state
    if (selectedMemories.length === 0) { alert("Please select at least one memory"); return }
    this.setState({ loading: true })
    try {
      const response = await fetch("/api/bulkcategorize/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryIds: selectedMemories, category: selectedCategory, tags: selectedTags }),
      })
      if (response.ok) {
        alert("Memories updated successfully!")
        await this.fetchMemories()
        this.setState({ selectedMemories: [], selectedCategory: "", selectedTags: [] })
      }
    } catch (error) {
      console.error("Error updating memories:", error)
      alert("Error updating memories")
    } finally { this.setState({ loading: false }) }
  }

  handleLike = async (memoryId, e) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bulkcategorize/like/${memoryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user-123" }),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState((prevState) => ({
          memories: prevState.memories.map((memory) =>
            memory._id === memoryId ? { ...memory, likes: data.likes, hasLiked: data.hasLiked } : memory
          ),
        }))
      }
    } catch (error) { console.error("Error liking memory:", error) }
  }

  handleShare = async (memoryId, e) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/bulkcategorize/share/${memoryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user-123" }),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState((prevState) => ({
          memories: prevState.memories.map((memory) =>
            memory._id === memoryId ? { ...memory, shares: data.shares } : memory
          ),
        }))
      }
    } catch (error) { console.error("Error sharing memory:", error) }
  }

  render() {
    const { memories, selectedMemories, categories, tags, selectedCategory, selectedTags, newCategory, newTag, loading, fetchingMemories } = this.state

    return (
      <div className="bulk-categorize">
        <div className="container">
          <header className="page-header">
            <Link to="/home-page" className="back-btn">← Back to Dashboard</Link>
            <div className="header-content">
              <div className="header-icon">🏷️</div>
              <h1>Bulk Categorize & Tag Memories</h1>
              <p>Organize multiple memories by assigning categories and tags in bulk</p>
            </div>
          </header>

          <div className="bulk-categorize-content">
            <div className="selection-panel">
              <div className="panel-header">
                <h3>Select Memories ({selectedMemories.length} selected)</h3>
                <div className="selection-actions">
                  <button onClick={this.handleSelectAll} className="btn btn-secondary">Select All</button>
                  <button onClick={this.handleDeselectAll} className="btn btn-secondary">Deselect All</button>
                </div>
              </div>

              {fetchingMemories ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading memories...</p>
                </div>
              ) : memories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📸</div>
                  <p>No memories available</p>
                  <button onClick={this.fetchMemories} className="btn btn-primary">Retry</button>
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
                        <p>{memory.description}</p>
                        <div className="memory-meta">
                          <span>By {memory.author}</span>
                          <span>{memory.createdAt ? new Date(memory.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div className="memory-actions">
                          <button className="action-btn like-btn" onClick={(e) => this.handleLike(memory._id, e)}>❤️ {memory.likes || 0}</button>
                          <button className="action-btn share-btn" onClick={(e) => this.handleShare(memory._id, e)}>📤 {memory.shares || 0}</button>
                          <button className="action-btn delete-btn" onClick={(e) => this.handleDeleteMemory(memory._id, e)}>🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Memory Form */}
            <div className="add-memory-form">
              <h3>Add New Memory</h3>
              <input type="text" name="title" placeholder="Title" value={this.state.newMemory.title} onChange={this.handleNewMemoryInputChange} />
              <input type="text" name="description" placeholder="Description" value={this.state.newMemory.description} onChange={this.handleNewMemoryInputChange} />
              <input type="text" name="author" placeholder="Author" value={this.state.newMemory.author} onChange={this.handleNewMemoryInputChange} />
              <input type="text" name="imageUrl" placeholder="Image URL" value={this.state.newMemory.imageUrl} onChange={this.handleNewMemoryInputChange} />
              <input type="text" name="category" placeholder="Category" value={this.state.newMemory.category} onChange={this.handleNewMemoryInputChange} />
              <div>
                <input type="text" placeholder="Add tag" value={this.state.newMemoryTagInput} onChange={(e) => this.setState({ newMemoryTagInput: e.target.value })} />
                <button onClick={this.handleAddNewMemoryTag} className="btn btn-secondary">Add Tag</button>
              </div>
              <div>
                {this.state.newMemory.tags.map((tag) => (
                  <span key={tag} style={{ marginRight: 5 }}>{tag} <button onClick={() => this.handleRemoveNewMemoryTag(tag)}>x</button></span>
                ))}
              </div>
              <button onClick={this.handleCreateMemory} className="btn btn-primary">Create Memory</button>
            </div>

            {/* Categorization Panel */}
            <div className="categorization-panel">
              <div className="category-section">
                <h3>Categories</h3>
                <div className="category-options">
                  {categories.map((category) => (
                    <label key={category} className="category-option">
                      <input type="radio" name="category" value={category} checked={selectedCategory === category} onChange={(e) => this.setState({ selectedCategory: e.target.value })} />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
                <div className="add-category">
                  <input type="text" placeholder="Add new category" value={newCategory} onChange={(e) => this.setState({ newCategory: e.target.value })} />
                  <button onClick={this.addNewCategory} className="btn btn-secondary">Add</button>
                </div>
              </div>

              <div className="tags-section">
                <h3>Tags</h3>
                <div className="tags-options">
                  {tags.map((tag) => (
                    <label key={tag} className="tag-option">
                      <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => this.handleTagToggle(tag)} />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
                <div className="add-tag">
                  <input type="text" placeholder="Add new tag" value={newTag} onChange={(e) => this.setState({ newTag: e.target.value })} />
                  <button onClick={this.addNewTag} className="btn btn-secondary">Add</button>
                </div>
              </div>

              <div className="action-section">
                <button onClick={this.handleBulkCategorize} className="btn btn-primary" disabled={loading || selectedMemories.length === 0}>
                  {loading ? "Updating..." : `Update ${selectedMemories.length} Memories`}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default BulkCategorizeForm
