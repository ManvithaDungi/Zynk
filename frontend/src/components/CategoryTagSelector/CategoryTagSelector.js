import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI, tagsAPI } from '../../utils/api';
import './CategoryTagSelector.css';

const CategoryTagSelector = ({ 
  selectedCategory, 
  selectedTags, 
  onCategoryChange, 
  onTagsChange,
  error 
}) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagSearch, setTagSearch] = useState('');

  // Fetch categories and tags
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesResponse, tagsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        tagsAPI.getPopular({ limit: 50 })
      ]);
      
      setCategories(categoriesResponse.data.categories);
      setTags(tagsResponse.data.tags);
    } catch (error) {
      console.error('Error fetching categories and tags:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
  };

  // Handle tag selection
  const handleTagToggle = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    if (isSelected) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  // Create new tag
  const createNewTag = async (tagName) => {
    if (!tagName.trim()) return;
    
    try {
      const response = await tagsAPI.create({ name: tagName.trim() });
      const newTag = response.data.tag;
      setTags(prev => [newTag, ...prev]);
      onTagsChange([...selectedTags, newTag.id]);
      setTagSearch('');
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Handle tag search
  const handleTagSearch = async (searchTerm) => {
    setTagSearch(searchTerm);
    if (searchTerm.length > 2) {
      try {
        const response = await tagsAPI.getAll({ search: searchTerm, limit: 20 });
        setTags(response.data.tags);
      } catch (error) {
        console.error('Error searching tags:', error);
      }
    } else if (searchTerm.length === 0) {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="category-tag-selector">
        <div className="loading-spinner"></div>
        <p>Loading categories and tags...</p>
      </div>
    );
  }

  return (
    <div className="category-tag-selector">
      {/* Category Selection */}
      <div className="form-group">
        <label className="form-label">Event Category *</label>
        <div className="category-grid">
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              className={`category-option ${selectedCategory === category.id ? 'selected' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
        {error?.category && (
          <div className="form-error" role="alert">
            {error.category}
          </div>
        )}
      </div>

      {/* Tag Selection */}
      <div className="form-group">
        <label className="form-label">Event Tags</label>
        <div className="tag-search-container">
          <input
            type="text"
            placeholder="Search or create tags..."
            value={tagSearch}
            onChange={(e) => handleTagSearch(e.target.value)}
            className="tag-search-input"
          />
        </div>
        
        <div className="tag-selection">
          <div className="selected-tags">
            {selectedTags.map(tagId => { const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <span key={tagId} className="selected-tag">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tagId)}
                    className="remove-tag">
                    x
                  </button>
                </span>
              ) : null;
            })}
          </div>

          <div className="available-tags">
            {tags
              .filter(tag => !selectedTags.includes(tag.id))
              .slice(0, 10)
              .map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className="tag-option"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
          </div>

          {tagSearch && !tags.find(tag => tag.name.toLowerCase() === tagSearch.toLowerCase()) && (
            <button
              type="button"
              className="create-tag-btn"
              onClick={() => createNewTag(tagSearch)}
            >
              Create "{tagSearch}"
            </button>
          )}
        </div>
        
        {error?.tags && (
          <div className="form-error" role="alert">
            {error.tags}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTagSelector;
