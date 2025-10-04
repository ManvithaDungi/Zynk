import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import { albumsAPI, postsAPI } from "../../utils/api";
import "./Albums.css";

const Albums = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  
  // Post creation states
  const [postCaption, setPostCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [captureMode, setCaptureMode] = useState(false);
  const [stream, setStream] = useState(null);

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

  // Fetch posts for selected album
  const fetchPosts = useCallback(async (albumId) => {
    try {
      const response = await albumsAPI.getPosts(albumId);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
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

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  // Remove media file
  const removeMedia = useCallback((index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Start camera capture
  const startCapture = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      setStream(mediaStream);
      setCaptureMode(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera");
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!stream) return;
    
    const video = document.getElementById("camera-preview");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setMediaFiles(prev => [...prev, file]);
      setMediaPreviews(prev => [...prev, URL.createObjectURL(file)]);
    }, "image/jpeg");
  }, [stream]);

  // Stop camera capture
  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptureMode(false);
  }, [stream]);

  // Create new post
  const createPost = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedAlbum) {
      alert("Please select an album first");
      return;
    }

    try {
      const mediaData = mediaFiles.map(file => ({
        url: URL.createObjectURL(file), // This should be handled by backend
        type: file.type.startsWith('image/') ? 'image' : 'video',
        filename: file.name
      }));

      const response = await postsAPI.create({
        caption: postCaption,
        album: selectedAlbum.id,
        media: mediaData
      });

      setPosts(prev => [response.data.post, ...prev]);
      setPostCaption("");
      setMediaFiles([]);
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviews([]);
      setShowCreatePost(false);
      stopCapture();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  }, [selectedAlbum, postCaption, mediaFiles, mediaPreviews, stopCapture]);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await postsAPI.delete(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Cleanup media preview URLs
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [stream, mediaPreviews]);

  // Fetch albums on mount
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Fetch posts when album is selected
  useEffect(() => {
    if (selectedAlbum) {
      fetchPosts(selectedAlbum.id);
    }
  }, [selectedAlbum, fetchPosts]);

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
          <span className="post-count">{album.postCount || 0} posts</span>
        </div>
      ))}
    </div>
  ), [albums, selectedAlbum]);

  // Memoized posts grid
  const postsGrid = useMemo(() => (
    <div className="posts-grid">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-media">
            {post.media && post.media.length > 0 && (
              <img 
                src={post.media[0].url} 
                alt="Post"
                className="post-image"
                loading="lazy"
              />
            )}
            {post.media && post.media.length > 1 && (
              <div className="media-count">
                +{post.media.length - 1}
              </div>
            )}
          </div>
          <div className="post-content">
            <p className="post-caption">{post.caption}</p>
            <div className="post-meta">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => deletePost(post.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), [posts, deletePost]);

  return (
    <div className="albums-page">
      <Navbar />
      
      <div className="albums-container">
        <div className="albums-header">
          <h1>My Albums</h1>
          <button 
            onClick={() => setShowCreateAlbum(true)}
            className="btn btn-primary"
          >
            Create Album
          </button>
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

          <div className="posts-section">
            {selectedAlbum ? (
              <>
                <div className="posts-header">
                  <div>
                    <h2>{selectedAlbum.name}</h2>
                    <p>{selectedAlbum.description}</p>
                  </div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="btn btn-primary"
                  >
                    Create Post
                  </button>
                </div>

                {postsGrid}
              </>
            ) : (
              <div className="empty-state">
                <h3>Select an album to view posts</h3>
                <p>Choose an album from the sidebar or create a new one</p>
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

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="modal-overlay" onClick={() => {
            setShowCreatePost(false);
            stopCapture();
          }}>
            <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Post</h2>
              <form onSubmit={createPost}>
                <div className="form-group">
                  <label>Caption</label>
                  <textarea
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Write a caption..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Media</label>
                  <div className="media-upload-section">
                    <div className="upload-buttons">
                      <label className="btn btn-secondary">
                        Upload Files
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                        />
                      </label>
                      {!captureMode ? (
                        <button type="button" onClick={startCapture} className="btn btn-secondary">
                          Use Camera
                        </button>
                      ) : (
                        <button type="button" onClick={stopCapture} className="btn btn-secondary">
                          Stop Camera
                        </button>
                      )}
                    </div>

                    {captureMode && stream && (
                      <div className="camera-section">
                        <video
                          id="camera-preview"
                          autoPlay
                          playsInline
                          ref={(video) => {
                            if (video && stream) {
                              video.srcObject = stream;
                            }
                          }}
                          className="camera-preview"
                        />
                        <button type="button" onClick={capturePhoto} className="btn btn-primary capture-btn">
                          Capture Photo
                        </button>
                      </div>
                    )}

                    {mediaPreviews.length > 0 && (
                      <div className="media-previews">
                        {mediaPreviews.map((preview, index) => (
                          <div key={index} className="media-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="remove-media-btn"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreatePost(false);
                      stopCapture();
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;