import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import { postsAPI, eventsAPI, memoriesAPI } from "../../utils/api";
import "./PrivacyManager.css";

const PrivacyManager = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [selectedMemories, setSelectedMemories] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    visibility: "public",
    allowedUsers: [],
    allowedGroups: [],
    downloadable: true,
    shareable: true,
  });
  // eslint-disable-next-line no-unused-vars
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");

  // Fetch all data on component mount
  const fetchAllData = useCallback(async () => {
    setFetchingData(true);
    setError("");
    try {
      await Promise.all([fetchMemories(), fetchUsers(), fetchGroups()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setFetchingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch memories (posts, events, and memories)
  const fetchMemories = async () => {
    try {
      // Fetch posts
      const postsResponse = await postsAPI.getAll();
      const posts = postsResponse.data.posts || [];
      
      // Fetch events
      const eventsResponse = await eventsAPI.getUpcoming();
      const events = eventsResponse.data.events || [];
      
      // Fetch memories
      const memoriesResponse = await memoriesAPI.getAll();
      const userMemories = memoriesResponse.data.memories || [];
      
      // Combine and format data, filtering to only show user's own content
      const combinedMemories = [
        ...posts
          .filter(post => {
            // ULTRA STRICT FILTERING: Only show posts that the user can actually edit
            if (!user || !post.user) return false;
            
            // Get the user ID from the JWT token (most reliable)
            const userId = user.id || user._id;
            if (!userId) return false;
            
            // Get the post user ID
            const postUserId = post.user._id || post.user.id;
            if (!postUserId) return false;
            
            // Only show if IDs match exactly
            return postUserId.toString() === userId.toString();
          })
          .map(post => ({
            _id: post.id || post._id, // Use id field if available, fallback to _id
            id: post.id || post._id,  // Also store as id for consistency
            title: post.caption || "Untitled Post",
            description: post.caption || "",
            author: post.user?.name || "Unknown",
            createdBy: post.createdBy,
            category: "Post",
            tags: [],
            imageUrl: post.media?.[0]?.url || "/images/posts/grand-opening-ceremony.png",
            createdAt: post.createdAt,
            type: "post",
            visibility: post.visibility || "public",
            settings: post.settings || { allowDownload: true, allowSharing: true, allowComments: true }
          })),
        ...events
          .filter(event => {
            // ULTRA STRICT FILTERING: Only show events that the user can actually edit
            if (!user || !event.organizer) return false;
            
            // Get the user ID from the JWT token (most reliable)
            const userId = user.id || user._id;
            if (!userId) return false;
            
            // Get the event organizer ID
            const eventOrganizerId = event.organizer._id || event.organizer.id;
            if (!eventOrganizerId) return false;
            
            // Only show if IDs match exactly
            return eventOrganizerId.toString() === userId.toString();
          })
          .map(event => ({
            _id: event.id || event._id, // Use id field if available, fallback to _id
            id: event.id || event._id,  // Also store as id for consistency
            title: event.title,
            description: event.description,
            author: event.organizer?.name || "Unknown",
            createdBy: event.organizer?._id,
            category: event.category || "Event",
            tags: event.tags || [],
            imageUrl: event.thumbnail?.url || event.eventImage || "/images/events/event1.jpg",
            createdAt: event.createdAt,
            type: "event",
            visibility: event.visibility || "public",
            settings: event.settings || { allowDownload: true, allowSharing: true, allowComments: true }
          })),
        ...userMemories
          .filter(memory => {
            // ULTRA STRICT FILTERING: Only show memories that the user can actually edit
            if (!user || !memory.createdBy) return false;
            
            // Get the user ID from the JWT token (most reliable)
            const userId = user.id || user._id;
            if (!userId) return false;
            
            // Get the memory creator ID
            const memoryCreatorId = memory.createdBy._id || memory.createdBy.id;
            if (!memoryCreatorId) return false;
            
            // Only show if IDs match exactly
            return memoryCreatorId.toString() === userId.toString();
          })
          .map(memory => ({
            _id: memory.id || memory._id, // Use id field if available, fallback to _id
            id: memory.id || memory._id,  // Also store as id for consistency
            title: memory.title || "Untitled Memory",
            description: memory.description || "",
            author: memory.createdBy?.name || "Unknown",
            createdBy: memory.createdBy?._id,
            category: "Memory",
            tags: memory.tags || [],
            imageUrl: memory.mediaUrl || "/images/memories/mem1.jpg",
            createdAt: memory.createdAt,
            type: "memory",
            visibility: memory.visibility || "public", // Default to public if not set
            settings: memory.settings || { allowDownload: true, allowSharing: true, allowComments: true } // Default settings
          }))
      ];
      
      console.log(`PrivacyManager: Filtered to ${combinedMemories.length} editable items (${posts.length} posts, ${events.length} events, ${userMemories.length} memories total)`);
      console.log(`PrivacyManager: User ID: ${user?.id || user?._id}, User Name: ${user?.name}`);
      
      // SAFETY CHECK: If we can't determine ownership clearly, show empty list
      if (combinedMemories.length === 0) {
        console.log('PrivacyManager: No editable content found - showing empty list');
      } else {
        console.log('PrivacyManager: Showing only content with exact ID matches');
      }
      
      setMemories(combinedMemories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      setMemories([]);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      // For now, we'll use a mock list of users since we don't have a getAll endpoint for users
      // In a real app, you'd fetch from privacyManagerAPI.getUsers()
      const mockUsers = [
        { _id: user?._id, name: user?.name || "Current User", email: user?.email || "user@example.com" }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  // Fetch groups (for now, we'll create a simple groups structure)
  const fetchGroups = async () => {
    try {
      // For now, we'll create some default groups
      // In a real app, you'd fetch from an API
      const defaultGroups = [
        { _id: "1", name: "Event Organizers", description: "Users who can organize events", members: [] },
        { _id: "2", name: "Content Creators", description: "Users who create posts and content", members: [] },
        { _id: "3", name: "Admins", description: "Administrative users", members: [] }
      ];
      setGroups(defaultGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    }
  };

  // Handle memory selection
  const handleMemorySelect = useCallback((memoryId) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId)
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    );
  }, []);

  // Handle visibility change
  const handleVisibilityChange = useCallback((visibility) => {
    setPrivacySettings(prev => ({
      ...prev,
      visibility,
      allowedUsers: visibility === "restricted" ? prev.allowedUsers : [],
      allowedGroups: visibility === "restricted" ? prev.allowedGroups : [],
    }));
  }, []);

  // Handle setting changes
  const handleSettingChange = useCallback((setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  }, []);

  // Handle user/group selection (future feature)
  // eslint-disable-next-line no-unused-vars
  const handleUserGroupChange = useCallback((type, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  // Apply privacy settings to selected memories
  const applyPrivacySettings = async () => {
    if (selectedMemories.length === 0) {
      setError("Please select at least one memory to update.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatePromises = selectedMemories
        .filter(memoryId => memoryId && memoryId !== undefined) // Filter out undefined IDs
        .map(async (memoryId) => {
          const memory = memories.find(m => (m._id === memoryId) || (m.id === memoryId));
          if (!memory) return { success: false, error: 'Memory not found' };

          // Check if user can modify this memory (same logic as filtering)
          const userId = user?.id || user?._id;
          let canModify = false;
          
          if (memory.type === "post") {
            const postUserId = memory.createdBy;
            canModify = postUserId && userId && postUserId.toString() === userId.toString();
          } else if (memory.type === "event") {
            const eventOrganizerId = memory.createdBy;
            canModify = eventOrganizerId && userId && eventOrganizerId.toString() === userId.toString();
          } else if (memory.type === "memory") {
            const memoryCreatorId = memory.createdBy;
            canModify = memoryCreatorId && userId && memoryCreatorId.toString() === userId.toString();
          }
          
          if (!canModify) {
            return { 
              success: false, 
              error: `You can only modify your own ${memory.type}s. This ${memory.type} was created by ${memory.author}.`,
              memoryTitle: memory.title
            };
          }

          const updateData = {
            visibility: privacySettings.visibility,
            settings: {
              allowDownload: privacySettings.downloadable,
              allowSharing: privacySettings.shareable,
              allowComments: privacySettings.allowComments || true,
            }
          };

          try {
            // Update based on memory type
            if (memory.type === "post") {
              await postsAPI.update(memoryId, updateData);
            } else if (memory.type === "event") {
              await eventsAPI.update(memoryId, updateData);
            } else if (memory.type === "memory") {
              await memoriesAPI.update(memoryId, updateData);
            }
            return { success: true, memoryTitle: memory.title };
          } catch (error) {
            return { 
              success: false, 
              error: error.response?.data?.message || 'Update failed',
              memoryTitle: memory.title
            };
          }
        });

      const results = await Promise.all(updatePromises);
      
      // Process results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        const errorMessages = failed.map(f => `${f.memoryTitle}: ${f.error}`).join('\n');
        setError(`Some updates failed:\n${errorMessages}`);
      }
      
      if (successful.length > 0) {
        console.log(`Successfully updated ${successful.length} memories:`, successful.map(s => s.memoryTitle));
        // Show success message
        setError(`Successfully updated ${successful.length} memories!`);
        setTimeout(() => setError(""), 3000); // Clear success message after 3 seconds
        
        // Update local state immediately with new visibility
        setMemories(prevMemories => 
          prevMemories.map(memory => {
            const isUpdated = selectedMemories.includes(memory._id);
            if (isUpdated) {
              return {
                ...memory,
                visibility: privacySettings.visibility,
                settings: {
                  allowDownload: privacySettings.downloadable,
                  allowSharing: privacySettings.shareable,
                  allowComments: privacySettings.allowComments || true,
                }
              };
            }
            return memory;
          })
        );
      }
      
      // Refresh memories to ensure we have the latest data
      await fetchMemories();
      setSelectedMemories([]);
      
      // Only clear error if there were no failures
      if (failed.length === 0) {
        setError("");
      }
      
      // Show success message (you could add a toast notification here)
      console.log("Privacy settings updated successfully!");
      
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      setError("Failed to update privacy settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedMemories([]);
  }, []);

  // Select all memories
  const selectAllMemories = useCallback(() => {
    setSelectedMemories(memories.map(memory => memory._id));
  }, [memories]);

  if (fetchingData) {
    return (
      <div className="privacy-manager">
        <Navbar />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="privacy-manager">
      <Navbar />
      
      <div className="container">
        <div className="page-header">
          <Link to="/home" className="back-btn">
            ← Back to Home
          </Link>
          
          <div className="header-content">
            <div className="header-icon">🛡️</div>
            <h1>Privacy & Visibility Manager</h1>
            <p>Control who can see your posts and events, and manage sharing permissions</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="privacy-content">
          {/* Memories Section */}
          <div className="memories-section">
            <div className="section-title">
              📸 Your Content ({memories.length} items)
            </div>
            
            {memories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No Content Found</div>
                <div className="empty-description">
                  Create some posts or events to manage their privacy settings.
                </div>
              </div>
            ) : (
              <>
                <div className="selection-controls">
                  <button 
                    className="btn btn-outline" 
                    onClick={selectAllMemories}
                  >
                    Select All
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </button>
                  <span className="selection-count">
                    {selectedMemories.length} selected
                  </span>
                </div>

                <div className="memories-grid">
                  {memories.map((memory) => (
                    <div
                      key={memory._id}
                      className={`memory-item ${selectedMemories.includes(memory._id) ? 'selected' : ''}`}
                      onClick={() => handleMemorySelect(memory._id)}
                    >
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="memory-image"
                        onError={(e) => {
                          e.target.src = "/images/memories/mem1.jpg";
                        }}
                      />
                      <div className="memory-info">
                        <div className="memory-caption">{memory.title}</div>
                        <div className="memory-meta">
                          <span>{memory.category}</span>
                          <div className={`privacy-status ${memory.visibility}`}>
                            {memory.visibility}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Privacy Settings Section */}
          <div className="privacy-settings-section">
            <div className="section-title">
              ⚙️ Privacy Settings
            </div>
            
            <div className="privacy-settings">
              <div className="setting-group">
                <label className="setting-label">Visibility Level</label>
                <div className="setting-description">
                  Control who can see this content
                </div>
                <div className="setting-controls">
                  <div className="radio-group">
                    <label className={`radio-option ${privacySettings.visibility === 'public' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={privacySettings.visibility === 'public'}
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                      />
                      <span className="radio-label">Public</span>
                    </label>
                    <div className="radio-description">Visible to everyone</div>
                    
                    <label className={`radio-option ${privacySettings.visibility === 'private' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={privacySettings.visibility === 'private'}
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                      />
                      <span className="radio-label">Private</span>
                    </label>
                    <div className="radio-description">Only visible to you</div>
                    
                    <label className={`radio-option ${privacySettings.visibility === 'friends' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="friends"
                        checked={privacySettings.visibility === 'friends'}
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                      />
                      <span className="radio-label">Friends Only</span>
                    </label>
                    <div className="radio-description">Visible to your connections</div>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Sharing Permissions</label>
                <div className="setting-description">
                  Control how others can interact with your content
                </div>
                <div className="setting-controls">
                  <div className="checkbox-group">
                    <label className={`checkbox-option ${privacySettings.shareable ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={privacySettings.shareable}
                        onChange={(e) => handleSettingChange('shareable', e.target.checked)}
                      />
                      <span className="checkbox-label">Allow Sharing</span>
                    </label>
                    
                    <label className={`checkbox-option ${privacySettings.downloadable ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={privacySettings.downloadable}
                        onChange={(e) => handleSettingChange('downloadable', e.target.checked)}
                      />
                      <span className="checkbox-label">Allow Download</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="actions-section">
              <div className="actions-title">Apply Settings</div>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={applyPrivacySettings}
                  disabled={loading || selectedMemories.length === 0}
                >
                  {loading ? "Updating..." : `Apply to ${selectedMemories.length} Items`}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={clearSelection}
                  disabled={selectedMemories.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyManager;