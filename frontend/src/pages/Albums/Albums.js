import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../../components/Navbar/Navbar";
import EnhancedMemoryForm from "../../components/EnhancedMemoryForm/EnhancedMemoryForm";
import { albumsAPI, memoriesAPI } from "../../utils/api";
import "./Albums.css";

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");

  // Fetch albums
  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const response = await albumsAPI.getAll();
      setAlbums(response.data.albums || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch memories for selected album
  const fetchMemories = useCallback(async (albumId) => {
    try {
      const response = await memoriesAPI.getByAlbum(albumId);
      setMemories(response.data.memories || []);
    } catch (error) {
      console.error("Error fetching memories:", error);
    }
  }, []);

  // Create new album
  const createAlbum = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await albumsAPI.create({
        name: newAlbumName,
        description: newAlbumDescription
      });
      setAlbums([response.data.album, ...albums]);
      setNewAlbumName("");
      setNewAlbumDescription("");
      setShowCreateAlbum(false);
    } catch (error) {
      console.error("Error creating album:", error);
      alert("Failed to create album");
    }
  }, [newAlbumName, newAlbumDescription, albums]);


  // Delete memory
  const deleteMemory = useCallback(async (memoryId) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;
    
    try {
      await memoriesAPI.delete(memoryId);
      setMemories(prev => prev.filter(memory => memory.id !== memoryId));
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory");
    }
  }, []);


  // Fetch albums on mount
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Fetch memories when album is selected
  useEffect(() => {
    if (selectedAlbum) {
      fetchMemories(selectedAlbum.id);
    }
  }, [selectedAlbum, fetchMemories]);

  // Memoized album list
  const albumList = useMemo(() => (
    <div className="albums-list">
      {albums.map(album => (
        <div
          key={album.id}
          className={`album-item ${selectedAlbum?.id === album.id ? "active" : ""}`}
          onClick={() => setSelectedAlbum(album)}
        >
          <h4>{album.name}</h4>
          <p>{album.description}</p>
          <span className="post-count">{album.memoriesCount || 0} memories</span>
        </div>
      ))}
    </div>
  ), [albums, selectedAlbum]);

  // Memoized memories grid
  const memoriesGrid = useMemo(() => (
    <div className="memories-grid">
      {memories.map(memory => (
        <div key={memory.id} className="memory-card">
          <div className="memory-media">
            <img 
              src={memory.mediaUrl || "/images/memories/mem4.jpg"} 
              alt={memory.title || "Memory"}
              className="memory-image"
              loading="lazy"
              onError={(e) => {
                e.target.src = "/images/memories/mem3.jpg";
              }}
            />
          </div>
          <div className="memory-content">
            <h4 className="memory-title">{memory.title || "Untitled Memory"}</h4>
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
              <span className="likes-count">❤️ {memory.likesCount || 0}</span>
              <span className="comments-count">💬 {memory.commentsCount || 0}</span>
            </div>
            <div className="memory-actions">
              <button
                onClick={() => deleteMemory(memory.id)}
                className="delete-btn"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), [memories, deleteMemory]);

  return (
    <div className="albums-page">
      <Navbar />
      
      <div className="albums-container">
        <div className="albums-header">
          <div>
            <h1>My Albums & Memories</h1>
            <p>Organize your event memories into albums or create standalone memories</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowCreateAlbum(true)}
              className="btn btn-secondary"
            >
              + New Album
            </button>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="btn btn-primary"
            >
              + Create Memory
            </button>
          </div>
        </div>

        <div className="albums-content">
          <div className="albums-sidebar">
            <h3>Albums</h3>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : albums.length === 0 ? (
              <p className="empty-message">No albums yet</p>
            ) : (
              albumList
            )}
          </div>

          <div className="memories-section">
            {selectedAlbum ? (
              <>
                <div className="memories-header">
                  <div>
                    <h2>{selectedAlbum.name}</h2>
                    <p>{selectedAlbum.description}</p>
                  </div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="btn btn-primary"
                  >
                    + Add Memory
                  </button>
                </div>

                {memoriesGrid}
              </>
            ) : (
              <div className="empty-state">
                <h3>Select an album to view memories</h3>
                <p>Choose an album from the sidebar to see its memories, or click "Create Memory" above to add a standalone memory</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Album Modal */}
        {showCreateAlbum && (
          <div className="modal-overlay" onClick={() => setShowCreateAlbum(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Album</h2>
              <form onSubmit={createAlbum}>
                <div className="form-group">
                  <label>Album Name</label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    required
                    placeholder="Enter album name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    placeholder="Enter album description"
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateAlbum(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Memory Creation Modal */}
        {showCreatePost && (
          <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
            <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
              <EnhancedMemoryForm
                albumId={selectedAlbum?.id}
                onClose={() => setShowCreatePost(false)}
                onSuccess={(newMemory) => {
                  // Refresh memories after successful creation
                  if (selectedAlbum) {
                    fetchMemories(selectedAlbum.id);
                  }
                  setShowCreatePost(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;