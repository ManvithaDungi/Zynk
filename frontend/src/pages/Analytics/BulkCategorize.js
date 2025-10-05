import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import "./BulkCategorize.css"

const BulkCategorize = () => {
  const [memories, setMemories] = useState([])
  const [selectedMemories, setSelectedMemories] = useState([])
  const [categories, setCategories] = useState(["highlights", "candid", "group", "photos", "videos", "testimonials"])
  const [tags, setTags] = useState(["fun", "memorable", "beautiful", "exciting", "emotional"])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingMemories, setFetchingMemories] = useState(true)

  const fetchMemories = useCallback(async () => {
    try {
      setFetchingMemories(true)
      // For now, use mock data since the backend endpoint might not exist
      const mockMemories = [
        {
          _id: "1",
          title: "Event Opening",
          description: "The grand opening of our annual conference",
          author: "John Doe",
          imageUrl: "https://via.placeholder.com/300x200",
          category: "highlights",
          tags: ["fun", "memorable"],
          createdAt: new Date().toISOString()
        },
        {
          _id: "2", 
          title: "Group Photo",
          description: "Team photo with all attendees",
          author: "Jane Smith",
          imageUrl: "https://via.placeholder.com/300x200",
          category: "group",
          tags: ["beautiful"],
          createdAt: new Date().toISOString()
        }
      ]
      setMemories(mockMemories)
    } catch (error) {
      console.error("Error fetching memories:", error)
      setMemories([])
    } finally {
      setFetchingMemories(false)
    }
  }, [])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const handleMemorySelect = useCallback((memoryId) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId)
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedMemories(memories.map(memory => memory._id))
  }, [memories])

  const handleDeselectAll = useCallback(() => {
    setSelectedMemories([])
  }, [])

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])


  const handleDeleteMemory = useCallback(async (memoryId, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this memory?")) return
    try {
      setMemories(prev => prev.filter(memory => memory._id !== memoryId))
      setSelectedMemories(prev => prev.filter(id => id !== memoryId))
      alert("Memory deleted successfully")
    } catch (error) {
      console.error("Error deleting memory:", error)
      alert("Error deleting memory")
    }
  }, [])

  // Future feature: Add new category dynamically
  // eslint-disable-next-line no-unused-vars
  const addNewCategory = useCallback(() => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory])
      setNewCategory("")
    }
  }, [newCategory, categories])

  // Future feature: Add new tag dynamically
  // eslint-disable-next-line no-unused-vars
  const addNewTag = useCallback(() => {
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag])
      setNewTag("")
    }
  }, [newTag, tags])

  const handleBulkUpdate = useCallback(async () => {
    if (selectedMemories.length === 0) {
      alert("Please select memories to update")
      return
    }
    try {
      setLoading(true)
      // Update selected memories with new category and tags
      setMemories(prev => 
        prev.map(memory => 
          selectedMemories.includes(memory._id)
            ? {
                ...memory,
                category: selectedCategory || memory.category,
                tags: selectedTags.length > 0 ? selectedTags : memory.tags
              }
            : memory
        )
      )
      setSelectedMemories([])
      setSelectedCategory("")
      setSelectedTags([])
      alert(`Updated ${selectedMemories.length} memories successfully`)
    } catch (error) {
      console.error("Error updating memories:", error)
      alert("Error updating memories")
    } finally {
      setLoading(false)
    }
  }, [selectedMemories, selectedCategory, selectedTags])

  return (
    <div className="bulk-categorize">
      <Navbar />
      <div className="container">
        <header className="page-header">
          <Link to="/analytics" className="back-link">
            ← Back to Analytics
          </Link>
          <h1>Bulk Categorize & Tag Memories</h1>
          <p>Organize your event memories by assigning categories and tags in bulk</p>
        </header>

        <div className="content-grid">
          {/* Memories List */}
          <div className="memories-section">
            <div className="section-header">
              <h2>Memories ({memories.length})</h2>
              <div className="selection-controls">
                <button onClick={handleSelectAll} className="btn btn-secondary">
                  Select All
                </button>
                <button onClick={handleDeselectAll} className="btn btn-secondary">
                  Deselect All
                </button>
              </div>
            </div>

            {fetchingMemories ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading memories...</p>
              </div>
            ) : memories.length === 0 ? (
              <div className="empty-state">
                <h3>No Memories Found</h3>
                <p>Create memories in the <Link to="/albums" style={{ color: '#000', textDecoration: 'underline' }}>Albums page</Link> to get started</p>
              </div>
            ) : (
              <div className="memories-grid">
                {memories.map((memory) => (
                  <div
                    key={memory._id}
                    className={`memory-card ${selectedMemories.includes(memory._id) ? 'selected' : ''}`}
                    onClick={() => handleMemorySelect(memory._id)}
                  >
                    <div className="memory-image">
                      <img src={memory.imageUrl} alt={memory.title} />
                    </div>
                    <div className="memory-content">
                      <h3>{memory.title}</h3>
                      <p>{memory.description}</p>
                      <div className="memory-meta">
                        <span className="author">By {memory.author}</span>
                        <span className="category">{memory.category}</span>
                      </div>
                      <div className="memory-tags">
                        {memory.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteMemory(memory._id, e)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="bulk-actions-section">
            <h2>Bulk Actions</h2>
            
            <div className="action-group">
              <h3>Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="action-group">
              <h3>Tags</h3>
              <div className="tags-list">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBulkUpdate}
              disabled={selectedMemories.length === 0 || loading}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : `Update ${selectedMemories.length} Memories`}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BulkCategorize