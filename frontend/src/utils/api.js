import axios from 'axios';

// Create axios instance with default config
// Use full URL to avoid proxy issues
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🚀🚀🚀 API UTILITY LOADED - VERSION 2.0 🚀🚀🚀');
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL ? config.baseURL + '/' + config.url : config.url;
    console.log('🔵 API Request:', config.method?.toUpperCase(), fullUrl);
    console.log('🔵 BaseURL:', config.baseURL);
    console.log('🔵 URL:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login (but not if already on login page)
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('auth/login', { email, password }),
  register: (username, email, password) => api.post('auth/register', { username, email, password }),
  logout: () => api.post('auth/logout'),
  getMe: () => api.get('auth/me'),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => api.get('events', { params }),
  getUpcoming: () => api.get('events/upcoming'),
  getUserRegistered: () => api.get('events/user/registered'),
  getById: (id) => api.get(`events/${id}`),
  create: (formData) => api.post('events/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`events/${id}`, data),
  delete: (id) => api.delete(`events/${id}`),
  register: (id) => api.post(`events/${id}/register`),
  unregister: (id) => api.post(`events/${id}/unregister`),
  // New enhanced features
  joinWaitlist: (id) => api.post(`events/${id}/waitlist`),
  leaveWaitlist: (id) => api.delete(`events/${id}/waitlist`),
  getWaitlist: (id) => api.get(`events/${id}/waitlist`),
  createRecurring: (data) => api.post('events/recurring', data),
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`users/${userId}`),
  updateProfile: (userId, data) => api.put(`users/${userId}`, data),
  follow: (userId) => api.post(`users/${userId}/follow`),
  unfollow: (userId) => api.post(`users/${userId}/unfollow`),
  getFollowers: (userId) => api.get(`users/${userId}/followers`),
  getFollowing: (userId) => api.get(`users/${userId}/following`),
  getUserPosts: (userId, params = {}) => api.get(`users/${userId}/posts`, { params }),
  deleteAccount: (userId) => api.delete(`users/${userId}`),
};

// Albums API
export const albumsAPI = {
  getAll: (params = {}) => api.get('albums', { params }),
  getByEvent: (eventId) => api.get(`albums/event/${eventId}`),
  getById: (id) => api.get(`albums/${id}`),
  create: (data) => api.post('albums', data),
  update: (id, data) => api.put(`albums/${id}`, data),
  delete: (id) => api.delete(`albums/${id}`),
  getPosts: (id, params = {}) => api.get(`albums/${id}/posts`, { params }),
};

// Posts API
export const postsAPI = {
  getAll: (params = {}) => api.get('posts', { params }),
  getById: (id) => api.get(`posts/${id}`),
  create: (data) => api.post('posts', data),
  update: (id, data) => api.put(`posts/${id}`, data),
  delete: (id) => api.delete(`posts/${id}`),
  like: (id) => api.post(`posts/${id}/like`),
  unlike: (id) => api.post(`posts/${id}/unlike`),
  addComment: (id, text) => api.post(`posts/${id}/comments`, { text }),
};

// Search API
export const searchAPI = {
  search: (query, type = 'all', params = {}) => api.get('search', { 
    params: { q: query, type, ...params } 
  }),
  searchUsers: (query, params = {}) => api.get('search/users', { 
    params: { q: query, ...params } 
  }),
  searchPosts: (query, params = {}) => api.get('search/posts', { 
    params: { q: query, ...params } 
  }),
};

// Explore API
export const exploreAPI = {
  getTrendingPosts: (params = {}) => api.get('explore/posts', { params }),
  getPopularUsers: (params = {}) => api.get('explore/users', { params }),
  getRecommended: (params = {}) => api.get('explore/recommended', { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('categories'),
  getById: (id) => api.get(`categories/${id}`),
  create: (data) => api.post('categories', data),
  update: (id, data) => api.put(`categories/${id}`, data),
  delete: (id) => api.delete(`categories/${id}`),
};

// Tags API
export const tagsAPI = {
  getAll: (params = {}) => api.get('tags', { params }),
  getPopular: (params = {}) => api.get('tags/popular', { params }),
  create: (data) => api.post('tags', data),
  updateUsage: (id, data) => api.put(`tags/${id}/usage`, data),
};

// Reviews API
export const reviewsAPI = {
  getByEvent: (eventId, params = {}) => api.get(`reviews/event/${eventId}`, { params }),
  getUserReview: (eventId) => api.get(`reviews/event/${eventId}/user`),
  create: (eventId, data) => api.post(`reviews/event/${eventId}`, data),
  markHelpful: (reviewId, data) => api.post(`reviews/${reviewId}/helpful`, data),
  delete: (reviewId) => api.delete(`reviews/${reviewId}`),
};

// Polls API
export const pollsAPI = {
  getByEvent: (eventId) => api.get(`polls/event/${eventId}`),
  create: (data) => api.post('polls', data),
  vote: (pollId, data) => api.post(`polls/${pollId}/vote`, data),
  update: (pollId, data) => api.put(`polls/${pollId}`, data),
  delete: (pollId) => api.delete(`polls/${pollId}`),
};

// Chat API
export const chatAPI = {
  getMessages: (eventId, params = {}) => api.get(`chat/event/${eventId}`, { params }),
  sendMessage: (eventId, data) => api.post(`chat/event/${eventId}`, data),
  deleteMessage: (messageId) => api.delete(`chat/messages/${messageId}`),
};

// Privacy Manager API
export const privacyManagerAPI = {
  getMemories: () => api.get('privacyManager/memories'),
  getUsers: () => api.get('privacyManager/users'),
  getGroups: () => api.get('privacyManager/groups'),
  getPrivacyByMemoryId: (memoryId) => api.get(`privacyManager/memory/${memoryId}`),
  createOrUpdatePrivacy: (data) => api.post('privacyManager', data),
  bulkUpdatePrivacy: (memoryIds, privacySettings) => api.put('privacyManager/bulk', { memoryIds, privacySettings }),
  deletePrivacySettings: (id) => api.delete(`privacyManager/${id}`),
};

export default api;