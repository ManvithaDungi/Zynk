import axios from 'axios';

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('✅ API Client Initialized - Base URL: http://localhost:5000/api');

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}/${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✓ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`✗ ${status || 'Network Error'} ${error.config?.url || 'Unknown'}:`, message);
    
    // Handle 401 Unauthorized - redirect to login
    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (email, password) => 
    api.post('auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('auth/register', { name, email, password }),
  
  logout: () => 
    api.post('auth/logout'),
  
  getMe: () => 
    api.get('auth/me'),
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  getAll: (params = {}) => 
    api.get('events', { params }),
  
  getUpcoming: () => 
    api.get('events/upcoming'),
  
  getUserRegistered: () => 
    api.get('events/user/registered'),
  
  getById: (id) => 
    api.get(`events/${id}`),
  
  create: (formData) => 
    api.post('events/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  update: (id, data) => 
    api.put(`events/${id}`, data),
  
  delete: (id) => 
    api.delete(`events/${id}`),
  
  register: (id) => 
    api.post(`events/${id}/register`),
  
  unregister: (id) => 
    api.post(`events/${id}/unregister`),
  
  joinWaitlist: (id) => 
    api.post(`events/${id}/waitlist`),
  
  leaveWaitlist: (id) => 
    api.delete(`events/${id}/waitlist`),
  
  getWaitlist: (id) => 
    api.get(`events/${id}/waitlist`),
  
  createRecurring: (data) => 
    api.post('events/recurring', data),
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  getProfile: (userId) => 
    api.get(`users/${userId}`),
  
  updateProfile: (userId, data) => 
    api.put(`users/${userId}`, data),
  
  follow: (userId) => 
    api.post(`users/${userId}/follow`),
  
  unfollow: (userId) => 
    api.post(`users/${userId}/unfollow`),
  
  getFollowers: (userId) => 
    api.get(`users/${userId}/followers`),
  
  getFollowing: (userId) => 
    api.get(`users/${userId}/following`),
  
  getUserPosts: (userId, params = {}) => 
    api.get(`users/${userId}/posts`, { params }),
  
  deleteAccount: (userId) => 
    api.delete(`users/${userId}`),
};

// ============================================
// ALBUMS API
// ============================================
export const albumsAPI = {
  getAll: (params = {}) => 
    api.get('albums', { params }),
  
  getByEvent: (eventId) => 
    api.get(`albums/event/${eventId}`),
  
  getById: (id) => 
    api.get(`albums/${id}`),
  
  create: (data) => 
    api.post('albums', data),
  
  update: (id, data) => 
    api.put(`albums/${id}`, data),
  
  delete: (id) => 
    api.delete(`albums/${id}`),
  
  getPosts: (id, params = {}) => 
    api.get(`albums/${id}/posts`, { params }),
};

// ============================================
// POSTS API
// ============================================
export const postsAPI = {
  getAll: (params = {}) => 
    api.get('posts', { params }),
  
  getUserPosts: (params = {}) => 
    api.get('posts/user', { params }),
  
  getById: (id) => 
    api.get(`posts/${id}`),
  
  create: (data) => 
    api.post('posts', data),
  
  update: (id, data) => 
    api.put(`posts/${id}`, data),
  
  delete: (id) => 
    api.delete(`posts/${id}`),
  
  like: (id) => 
    api.post(`posts/${id}/like`),
  
  unlike: (id) => 
    api.post(`posts/${id}/unlike`),
  
  addComment: (id, text) => 
    api.post(`posts/${id}/comments`, { text }),
};

// ============================================
// SEARCH API
// ============================================
export const searchAPI = {
  search: (query, type = 'all', params = {}) => 
    api.get('search', { params: { q: query, type, ...params } }),
  
  searchUsers: (query, params = {}) => 
    api.get('search/users', { params: { q: query, ...params } }),
  
  searchPosts: (query, params = {}) => 
    api.get('search/posts', { params: { q: query, ...params } }),
};

// ============================================
// EXPLORE API
// ============================================
export const exploreAPI = {
  getTrendingPosts: (params = {}) => 
    api.get('explore/posts', { params }),
  
  getPopularUsers: (params = {}) => 
    api.get('explore/users', { params }),
  
  getRecommended: (params = {}) => 
    api.get('explore/recommended', { params }),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesAPI = {
  getAll: () => 
    api.get('categories'),
  
  getById: (id) => 
    api.get(`categories/${id}`),
  
  create: (data) => 
    api.post('categories', data),
  
  update: (id, data) => 
    api.put(`categories/${id}`, data),
  
  delete: (id) => 
    api.delete(`categories/${id}`),
};

// ============================================
// TAGS API
// ============================================
export const tagsAPI = {
  getAll: (params = {}) => 
    api.get('tags', { params }),
  
  getPopular: (params = {}) => 
    api.get('tags/popular', { params }),
  
  create: (data) => 
    api.post('tags', data),
  
  updateUsage: (id, data) => 
    api.put(`tags/${id}/usage`, data),
};

// ============================================
// REVIEWS API
// ============================================
export const reviewsAPI = {
  getByEvent: (eventId, params = {}) => 
    api.get(`reviews/event/${eventId}`, { params }),
  
  getUserReview: (eventId) => 
    api.get(`reviews/event/${eventId}/user`),
  
  create: (eventId, data) => 
    api.post(`reviews/event/${eventId}`, data),
  
  markHelpful: (reviewId, data) => 
    api.post(`reviews/${reviewId}/helpful`, data),
  
  delete: (reviewId) => 
    api.delete(`reviews/${reviewId}`),
};

// ============================================
// POLLS API
// ============================================
export const pollsAPI = {
  getByEvent: (eventId) => 
    api.get(`polls/event/${eventId}`),
  
  create: (data) => 
    api.post('polls', data),
  
  vote: (pollId, data) => 
    api.post(`polls/${pollId}/vote`, data),
  
  update: (pollId, data) => 
    api.put(`polls/${pollId}`, data),
  
  delete: (pollId) => 
    api.delete(`polls/${pollId}`),
};

// ============================================
// CHAT API
// ============================================
export const chatAPI = {
  getMessages: (eventId, params = {}) => 
    api.get(`chat/event/${eventId}`, { params }),
  
  sendMessage: (eventId, data) => 
    api.post(`chat/event/${eventId}`, data),
  
  deleteMessage: (messageId) => 
    api.delete(`chat/messages/${messageId}`),
};

// ============================================
// MEMORIES API
// ============================================
export const memoriesAPI = {
  getAll: (params = {}) => 
    api.get('memories', { params }),
  
  getByAlbum: (albumId, params = {}) => 
    api.get(`memories/album/${albumId}`, { params }),
  
  getByEvent: (eventId, params = {}) => 
    api.get(`memories/event/${eventId}`, { params }),
  
  getById: (id) => 
    api.get(`memories/${id}`),
  
  create: (data) => 
    api.post('memories', data),
  
  update: (id, data) => 
    api.put(`memories/${id}`, data),
  
  delete: (id) => 
    api.delete(`memories/${id}`),
  
  like: (id) => 
    api.post(`memories/${id}/like`),
  
  addComment: (id, text) => 
    api.post(`memories/${id}/comment`, { text }),
};

// ============================================
// COMMUNICATION API
// ============================================
export const communicationAPI = {
  // Messages
  getMessages: (params = {}) => 
    api.get('communication/messages', { params }),
  sendMessage: (data) => 
    api.post('communication/messages', data),
  editMessage: (messageId, data) => 
    api.put(`communication/messages/${messageId}`, data),
  deleteMessage: (messageId) => 
    api.delete(`communication/messages/${messageId}`),
  
  // Polls
  getPolls: (params = {}) => 
    api.get('communication/polls', { params }),
  createPoll: (data) => 
    api.post('communication/polls', data),
  votePoll: (pollId, data) => 
    api.post(`communication/polls/${pollId}/vote`, data),
  closePoll: (pollId) => 
    api.put(`communication/polls/${pollId}/close`),
  deletePoll: (pollId) => 
    api.delete(`communication/polls/${pollId}`),
  
  // Users
  getUsers: (params = {}) => 
    api.get('communication/users', { params }),
  createUser: (data) => 
    api.post('communication/users', data),
  updateUser: (userId, data) => 
    api.put(`communication/users/${userId}`, data),
  deleteUser: (userId) => 
    api.delete(`communication/users/${userId}`),
  
  // Stats
  getStats: () => 
    api.get('communication/stats')
};

// ============================================
// EXPORT API
// ============================================
export const exportAPI = {
  exportUsersCSV: () => 
    api.get('export/users/csv', { responseType: 'blob' }),
  exportMessagesCSV: () => 
    api.get('export/messages/csv', { responseType: 'blob' }),
  exportPollsCSV: () => 
    api.get('export/polls/csv', { responseType: 'blob' }),
  exportAllJSON: () => 
    api.get('export/all/json', { responseType: 'blob' })
};

// ============================================
// PRIVACY MANAGER API
// ============================================
export const privacyManagerAPI = {
  getMemories: () => 
    api.get('privacyManager/memories'),
  
  getUsers: () => 
    api.get('privacyManager/users'),
  
  getGroups: () => 
    api.get('privacyManager/groups'),
  
  getPrivacyByMemoryId: (memoryId) => 
    api.get(`privacyManager/memory/${memoryId}`),
  
  createOrUpdatePrivacy: (data) => 
    api.post('privacyManager', data),
  
  bulkUpdatePrivacy: (memoryIds, privacySettings) => 
    api.put('privacyManager/bulk', { memoryIds, privacySettings }),
  
  deletePrivacySettings: (id) => 
    api.delete(`privacyManager/${id}`),
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default api;

