import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (username, email, password) => api.post('/api/auth/register', { username, email, password }),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => api.get('/api/events', { params }),
  getUpcoming: () => api.get('/api/events/upcoming'),
  getUserRegistered: () => api.get('/api/events/user/registered'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (formData) => api.post('/api/events/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  register: (id) => api.post(`/api/events/${id}/register`),
  unregister: (id) => api.post(`/api/events/${id}/unregister`),
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/api/users/${userId}`, data),
  follow: (userId) => api.post(`/api/users/${userId}/follow`),
  unfollow: (userId) => api.post(`/api/users/${userId}/unfollow`),
  getFollowers: (userId) => api.get(`/api/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/api/users/${userId}/following`),
  getUserPosts: (userId, params = {}) => api.get(`/api/users/${userId}/posts`, { params }),
  deleteAccount: (userId) => api.delete(`/api/users/${userId}`),
};

// Albums API
export const albumsAPI = {
  getAll: (params = {}) => api.get('/api/albums', { params }),
  getByEvent: (eventId) => api.get(`/api/albums/event/${eventId}`),
  getById: (id) => api.get(`/api/albums/${id}`),
  create: (data) => api.post('/api/albums', data),
  update: (id, data) => api.put(`/api/albums/${id}`, data),
  delete: (id) => api.delete(`/api/albums/${id}`),
  getPosts: (id, params = {}) => api.get(`/api/albums/${id}/posts`, { params }),
};

// Posts API
export const postsAPI = {
  getAll: (params = {}) => api.get('/api/posts', { params }),
  getById: (id) => api.get(`/api/posts/${id}`),
  create: (data) => api.post('/api/posts', data),
  update: (id, data) => api.put(`/api/posts/${id}`, data),
  delete: (id) => api.delete(`/api/posts/${id}`),
  like: (id) => api.post(`/api/posts/${id}/like`),
  unlike: (id) => api.post(`/api/posts/${id}/unlike`),
  addComment: (id, text) => api.post(`/api/posts/${id}/comments`, { text }),
};

// Search API
export const searchAPI = {
  search: (query, type = 'all', params = {}) => api.get('/api/search', { 
    params: { q: query, type, ...params } 
  }),
  searchUsers: (query, params = {}) => api.get('/api/search/users', { 
    params: { q: query, ...params } 
  }),
  searchPosts: (query, params = {}) => api.get('/api/search/posts', { 
    params: { q: query, ...params } 
  }),
};

// Explore API
export const exploreAPI = {
  getTrendingPosts: (params = {}) => api.get('/api/explore/posts', { params }),
  getPopularUsers: (params = {}) => api.get('/api/explore/users', { params }),
  getRecommended: (params = {}) => api.get('/api/explore/recommended', { params }),
};

export default api;
