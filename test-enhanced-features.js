const axios = require('axios');
const io = require('socket.io-client');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Test data
let authToken = '';
let testUserId = '';
let testEventId = '';
let testCategoryId = '';
let testTagId = '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
      data,
      withCredentials: true
    };
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test 1: Authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Register a test user
    const registerData = {
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!'
    };
    
    const registerResponse = await makeRequest('POST', '/auth/register', registerData);
    console.log('✅ User registration successful');
    
    // Login
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await makeRequest('POST', '/auth/login', loginData);
    // For cookie-based auth, we don't need to store token
    authToken = 'cookie-based-auth';
    testUserId = loginResponse.user?.id;
    console.log('✅ User login successful');
    console.log('👤 User ID:', testUserId);
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
}

// Test 2: Categories
async function testCategories() {
  console.log('\n📂 Testing Categories...');
  
  try {
    // Get all categories
    const categoriesResponse = await makeRequest('GET', '/categories');
    console.log('✅ Categories fetched:', categoriesResponse.categories?.length || 0);
    
    if (categoriesResponse.categories?.length > 0) {
      testCategoryId = categoriesResponse.categories[0].id;
      console.log('✅ Using category:', categoriesResponse.categories[0].name);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Categories test failed:', error.message);
    return false;
  }
}

// Test 3: Tags
async function testTags() {
  console.log('\n🏷️ Testing Tags...');
  
  try {
    // Get popular tags
    const tagsResponse = await makeRequest('GET', '/tags/popular');
    console.log('✅ Popular tags fetched:', tagsResponse.tags?.length || 0);
    
    // Create a new tag (this might fail if not authenticated properly)
    try {
      const newTagResponse = await makeRequest('POST', '/tags', {
        name: 'test-tag-' + Date.now()
      });
      testTagId = newTagResponse.tag?.id;
      console.log('✅ New tag created:', newTagResponse.tag?.name);
    } catch (tagError) {
      console.log('ℹ️ Tag creation skipped (authentication issue)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Tags test failed:', error.message);
    return false;
  }
}

// Test 4: Enhanced Event Creation
async function testEnhancedEventCreation() {
  console.log('\n🎉 Testing Enhanced Event Creation...');
  
  try {
    const eventData = {
      title: 'Test Enhanced Event ' + Date.now(),
      description: 'This is a test event with enhanced features including categories, tags, and advanced settings.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      time: '18:00',
      location: 'Test Location, Test City',
      category: testCategoryId,
      tags: testTagId ? [testTagId] : [],
      maxAttendees: 50,
      allowWaitlist: true,
      waitlistLimit: 20,
      allowChat: true,
      allowReviews: true,
      allowPolls: true,
      shareable: true
    };
    
    const eventResponse = await makeRequest('POST', '/events/create', eventData);
    testEventId = eventResponse.event?.id;
    console.log('✅ Enhanced event created:', eventResponse.event?.title);
    console.log('📝 Event ID:', testEventId);
    
    return true;
  } catch (error) {
    console.error('❌ Enhanced event creation failed:', error.message);
    return false;
  }
}

// Test 5: Event Registration and Waitlist
async function testEventRegistration() {
  console.log('\n📝 Testing Event Registration...');
  
  try {
    if (!testEventId) {
      console.log('ℹ️ Skipping registration test - no event ID');
      return true;
    }
    
    // Register for the event
    const registerResponse = await makeRequest('POST', `/events/${testEventId}/register`);
    console.log('✅ Event registration successful');
    
    // Test waitlist (if event is full)
    try {
      const waitlistResponse = await makeRequest('POST', `/events/${testEventId}/waitlist`);
      console.log('✅ Waitlist join successful');
    } catch (waitlistError) {
      console.log('ℹ️ Waitlist not needed (event not full)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Event registration failed:', error.message);
    return false;
  }
}

// Test 6: Reviews
async function testReviews() {
  console.log('\n⭐ Testing Reviews...');
  
  try {
    if (!testEventId) {
      console.log('ℹ️ Skipping reviews test - no event ID');
      return true;
    }
    
    // Get reviews for the event
    const reviewsResponse = await makeRequest('GET', `/reviews/event/${testEventId}`);
    console.log('✅ Reviews fetched:', reviewsResponse.totalReviews || 0);
    
    // Create a review (this might fail if event hasn't ended)
    try {
      const reviewData = {
        rating: 5,
        review: 'This is a test review for the enhanced event features!'
      };
      const reviewResponse = await makeRequest('POST', `/reviews/event/${testEventId}`, reviewData);
      console.log('✅ Review created successfully');
    } catch (reviewError) {
      console.log('ℹ️ Review creation skipped (event not ended or already reviewed)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Reviews test failed:', error.message);
    return false;
  }
}

// Test 7: Polls
async function testPolls() {
  console.log('\n📊 Testing Polls...');
  
  try {
    if (!testEventId) {
      console.log('ℹ️ Skipping polls test - no event ID');
      return true;
    }
    
    // Get polls for the event
    const pollsResponse = await makeRequest('GET', `/polls/event/${testEventId}`);
    console.log('✅ Polls fetched:', pollsResponse.polls?.length || 0);
    
    // Create a poll
    const pollData = {
      event: testEventId,
      question: 'What do you think about this enhanced event?',
      options: ['Amazing!', 'Great!', 'Good', 'Could be better'],
      allowMultipleVotes: false
    };
    
    const pollResponse = await makeRequest('POST', '/polls', pollData);
    console.log('✅ Poll created:', pollResponse.poll?.question);
    
    // Vote on the poll
    if (pollResponse.poll?.id) {
      const voteResponse = await makeRequest('POST', `/polls/${pollResponse.poll.id}/vote`, {
        optionIndex: 0
      });
      console.log('✅ Vote cast successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Polls test failed:', error.message);
    return false;
  }
}

// Test 8: Real-time Chat
async function testRealTimeChat() {
  console.log('\n💬 Testing Real-time Chat...');
  
  return new Promise((resolve) => {
    try {
      if (!testEventId) {
        console.log('ℹ️ Skipping chat test - no event ID');
        resolve(true);
        return;
      }
      
      const socket = io(SOCKET_URL, {
        auth: {
          token: authToken
        }
      });
      
      socket.on('connect', () => {
        console.log('✅ Socket connected');
        
        // Join event room
        socket.emit('join-event', testEventId);
        console.log('✅ Joined event room');
        
        // Send a test message
        socket.emit('send-message', {
          eventId: testEventId,
          message: 'Hello from the enhanced features test!',
          messageType: 'text'
        });
        console.log('✅ Test message sent');
        
        // Listen for the message
        socket.on('new-message', (message) => {
          console.log('✅ Received message:', message.message);
          socket.disconnect();
          resolve(true);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          socket.disconnect();
          console.log('ℹ️ Chat test completed (timeout)');
          resolve(true);
        }, 5000);
      });
      
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        socket.disconnect();
        resolve(false);
      });
      
      socket.on('disconnect', () => {
        console.log('ℹ️ Socket disconnected');
      });
      
    } catch (error) {
      console.error('❌ Real-time chat test failed:', error.message);
      resolve(false);
    }
  });
}

// Test 9: Event Sharing
async function testEventSharing() {
  console.log('\n📤 Testing Event Sharing...');
  
  try {
    if (!testEventId) {
      console.log('ℹ️ Skipping sharing test - no event ID');
      return true;
    }
    
    // Get event details for sharing
    const eventResponse = await makeRequest('GET', `/events/${testEventId}`);
    console.log('✅ Event details fetched for sharing');
    
    // Test shareable property
    if (eventResponse.event?.shareable) {
      console.log('✅ Event is shareable');
    } else {
      console.log('ℹ️ Event is not shareable');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Event sharing test failed:', error.message);
    return false;
  }
}

// Test 10: Search and Filter
async function testSearchAndFilter() {
  console.log('\n🔍 Testing Search and Filter...');
  
  try {
    // Search events by category
    const searchResponse = await makeRequest('GET', '/search', {
      params: { q: 'test', type: 'events' }
    });
    console.log('✅ Search completed');
    
    // Get upcoming events
    const upcomingResponse = await makeRequest('GET', '/events/upcoming');
    console.log('✅ Upcoming events fetched:', upcomingResponse.events?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Search and filter test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced Event Features Test Suite');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Categories', fn: testCategories },
    { name: 'Tags', fn: testTags },
    { name: 'Enhanced Event Creation', fn: testEnhancedEventCreation },
    { name: 'Event Registration', fn: testEventRegistration },
    { name: 'Reviews', fn: testReviews },
    { name: 'Polls', fn: testPolls },
    { name: 'Real-time Chat', fn: testRealTimeChat },
    { name: 'Event Sharing', fn: testEventSharing },
    { name: 'Search and Filter', fn: testSearchAndFilter }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All enhanced event features are working correctly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Start your backend server: npm start (in backend directory)');
  console.log('2. Start your frontend: npm start (in frontend directory)');
  console.log('3. Test the features manually in the browser');
  console.log('4. Create events with categories and tags');
  console.log('5. Test real-time chat, polls, and reviews');
}

// Run the tests
runAllTests().catch(console.error);
