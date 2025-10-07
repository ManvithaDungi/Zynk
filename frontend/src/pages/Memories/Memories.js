import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import EnhancedMemoryForm from "../../components/EnhancedMemoryForm/EnhancedMemoryForm";
import { memoriesAPI } from "../../utils/api";
import "./Memories.css";

const Memories = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Fetch all memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await memoriesAPI.getAll();
        setMemories(response.data.memories || []);
      } catch (error) {
        console.error("Error fetching memories:", error);
        setError("Failed to load memories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMemories();
    }
  }, [user]);

  const handleCreateStandaloneMemory = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = async (newMemory) => {
    // Refresh memories list by fetching from API
    try {
      const response = await memoriesAPI.getAll();
      setMemories(response.data.memories || []);
    } catch (error) {
      console.error("Error refreshing memories:", error);
    }
    
    setShowForm(false);
    
    // Show success message
    alert("Memory created successfully!");
  };

  const handleDeleteMemory = async (memoryId) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await memoriesAPI.delete(memoryId);
        
        // Refresh memories list by fetching from API
        const response = await memoriesAPI.getAll();
        setMemories(response.data.memories || []);
        
        alert("Memory deleted successfully!");
      } catch (error) {
        console.error("Error deleting memory:", error);
        alert("Failed to delete memory. Please try again.");
      }
    }
  };

  if (!user) {
    return (
      <div className="memories-page">
        <Navbar />
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to view your memories.</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="memories-page">
        <Navbar />
        <div className="memory-form-container">
          <EnhancedMemoryForm
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="memories-page">
      <Navbar />
      <main className="memories-container">
        <header className="page-header">
          <div className="header-content">
            <h1>My Memories</h1>
            <p>All memories you've created</p>
          </div>
          <button 
            className="create-memory-btn"
            onClick={handleCreateStandaloneMemory}
          >
            <span className="btn-icon">+</span>
            Create Standalone Memory
          </button>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your memories...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Memories</h3>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : memories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📸</div>
            <h3>No Memories Yet</h3>
            <p>Start creating memories to see them here!</p>
            <button 
              className="create-first-memory-btn"
              onClick={handleCreateStandaloneMemory}
            >
              Create Your First Memory
            </button>
          </div>
        ) : (
          <div className="memories-grid">
            {memories.map((memory) => (
              <div key={memory.id} className="memory-card">
                <div className="memory-image">
                  <img 
                    src={memory.mediaUrl || "/placeholder.jpg"} 
                    alt={memory.title || "Memory"} 
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="memory-content">
                  <h3 className="memory-title">
                    {memory.title || "Untitled Memory"}
                  </h3>
                  {memory.description && (
                    <p className="memory-description">{memory.description}</p>
                  )}
                  <div className="memory-meta">
                    <span className="memory-date">
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </span>
                    <span className="memory-author">
                      by {memory.createdBy?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="memory-stats">
                    <span className="likes-count">
                      ❤️ {memory.likesCount || 0}
                    </span>
                    <span className="comments-count">
                      💬 {memory.commentsCount || 0}
                    </span>
                  </div>
                </div>
                <div className="memory-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteMemory(memory.id)}
                    title="Delete memory"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Memories;
