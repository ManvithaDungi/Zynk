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
  // New enhanced features
  joinWaitlist: (id) => api.post(`/api/events/${id}/waitlist`),
  leaveWaitlist: (id) => api.delete(`/api/events/${id}/waitlist`),
  getWaitlist: (id) => api.get(`/api/events/${id}/waitlist`),
  createRecurring: (data) => api.post('/api/events/recurring', data),
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

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Tags API
export const tagsAPI = {
  getAll: (params = {}) => api.get('/api/tags', { params }),
  getPopular: (params = {}) => api.get('/api/tags/popular', { params }),
  create: (data) => api.post('/api/tags', data),
  updateUsage: (id, data) => api.put(`/api/tags/${id}/usage`, data),
};

// Reviews API
export const reviewsAPI = {
  getByEvent: (eventId, params = {}) => api.get(`/api/reviews/event/${eventId}`, { params }),
  getUserReview: (eventId) => api.get(`/api/reviews/event/${eventId}/user`),
  create: (eventId, data) => api.post(`/api/reviews/event/${eventId}`, data),
  markHelpful: (reviewId, data) => api.post(`/api/reviews/${reviewId}/helpful`, data),
  delete: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
};

// Polls API
export const pollsAPI = {
  getByEvent: (eventId) => api.get(`/api/polls/event/${eventId}`),
  create: (data) => api.post('/api/polls', data),
  vote: (pollId, data) => api.post(`/api/polls/${pollId}/vote`, data),
  update: (pollId, data) => api.put(`/api/polls/${pollId}`, data),
  delete: (pollId) => api.delete(`/api/polls/${pollId}`),
};

// Chat API
export const chatAPI = {
  getMessages: (eventId, params = {}) => api.get(`/api/chat/event/${eventId}`, { params }),
  sendMessage: (eventId, data) => api.post(`/api/chat/event/${eventId}`, data),
  deleteMessage: (messageId) => api.delete(`/api/chat/messages/${messageId}`),
};

export default api;