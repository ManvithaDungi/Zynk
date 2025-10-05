import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import EnhancedMemoryForm from "../../components/EnhancedMemoryForm/EnhancedMemoryForm";
import { albumsAPI, postsAPI } from "../../utils/api";
import "./CreateMemory.css";

const CreateMemory = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch user's albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await albumsAPI.getAll();
        setAlbums(response.data.albums || []);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAlbums();
    }
  }, [user]);

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setShowForm(true);
  };

  const handleCreateStandaloneMemory = () => {
    setSelectedAlbum(null); // No album selected for standalone memory
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAlbum(null);
  };

  const handleFormSuccess = (newMemory) => {
    // Optionally refresh albums or show success message
    console.log("Memory created successfully:", newMemory);
    setShowForm(false);
    setSelectedAlbum(null);
    
    // Show success message
    alert("Memory created successfully!");
  };

  if (!user) {
    return (
      <div className="create-memory-page">
        <Navbar />
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to create memories.</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="create-memory-page">
        <Navbar />
        <div className="memory-form-container">
          <EnhancedMemoryForm
            albumId={selectedAlbum?.id}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="create-memory-page">
      <Navbar />
      <main className="create-memory-container">
        <header className="page-header">
          <h1>Create New Memory</h1>
          <p>Choose how you'd like to create your memory</p>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your albums...</p>
          </div>
        ) : (
          <div className="memory-creation-options">
            {/* Standalone Memory Option */}
            <div className="creation-option standalone">
              <div className="option-icon">📝</div>
              <h3>Create Standalone Memory</h3>
              <p>Create a memory that's not associated with any specific album. Perfect for quick captures or personal notes.</p>
              <button 
                onClick={handleCreateStandaloneMemory}
                className="btn btn-primary"
              >
                Create Standalone Memory
              </button>
            </div>

            {/* Album-based Memory Options */}
            {albums.length > 0 ? (
              <div className="album-options">
                <h3>Add to Existing Album</h3>
                <p>Choose an album to add your memory to:</p>
                <div className="albums-grid">
                  {albums.map((album) => (
                    <div key={album.id} className="album-option">
                      <div className="album-info">
                        <h4>{album.name}</h4>
                        <p>{album.description || "No description"}</p>
                        <div className="album-meta">
                          <span>📁 {album.posts?.length || 0} memories</span>
                          <span>📅 {new Date(album.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAlbumSelect(album)}
                        className="btn btn-secondary"
                      >
                        Add to Album
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-albums">
                <div className="no-albums-icon">📁</div>
                <h3>No Albums Found</h3>
                <p>You don't have any albums yet. Create a standalone memory or visit the Albums page to create your first album.</p>
                <div className="no-albums-actions">
                  <button 
                    onClick={handleCreateStandaloneMemory}
                    className="btn btn-primary"
                  >
                    Create Standalone Memory
                  </button>
                  <a href="/albums" className="btn btn-secondary">
                    Go to Albums
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Tips */}
        <div className="quick-tips">
          <h3>💡 Quick Tips</h3>
          <ul>
            <li>Use the camera feature to capture photos and videos directly</li>
            <li>Add tags to make your memories easier to find later</li>
            <li>Set privacy levels to control who can see your memories</li>
            <li>Use the styling options to customize how your memory looks</li>
            <li>Set reminders to revisit important memories</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CreateMemory;
