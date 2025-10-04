const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'testadmin',
  email: 'admin@test.com',
  password: 'password123'
};

const testEvent = {
  title: 'Test Event',
  description: 'This is a test event for admin CRUD operations',
  category: 'Workshop',
  date: '2024-12-31',
  time: '14:00',
  location: 'Test Location',
  maxAttendees: 50
};

let authToken = '';
let userId = '';
let eventId = '';

async function testAdminCRUD() {
  console.log('🚀 Starting Admin CRUD Operations Test\n');

  try {
    // 1. Test User Registration
    console.log('1. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ User registration successful:', registerResponse.data);
      userId = registerResponse.data.userId;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  User already exists, proceeding with login...');
      } else {
        console.log('❌ User registration failed:', error.response?.data || error.message);
      }
    }

    // 2. Test User Login
    console.log('\n2. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful:', loginResponse.data);
    
    // Extract token from cookies
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies) {
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      if (tokenCookie) {
        authToken = tokenCookie.split('=')[1].split(';')[0];
        console.log('✅ Auth token extracted');
      }
    }

    // 3. Test GET Events
    console.log('\n3. Testing GET Events...');
    const eventsResponse = await axios.get(`${BASE_URL}/events/upcoming`);
    console.log('✅ GET Events successful:', eventsResponse.data);

    // 4. Test CREATE Event
    console.log('\n4. Testing CREATE Event...');
    const createEventResponse = await axios.post(`${BASE_URL}/events`, testEvent, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ CREATE Event successful:', createEventResponse.data);
    eventId = createEventResponse.data.event.id;

    // 5. Test GET Single Event
    console.log('\n5. Testing GET Single Event...');
    const singleEventResponse = await axios.get(`${BASE_URL}/events/${eventId}`);
    console.log('✅ GET Single Event successful:', singleEventResponse.data);

    // 6. Test UPDATE Event
    console.log('\n6. Testing UPDATE Event...');
    const updatedEvent = { ...testEvent, title: 'Updated Test Event', description: 'Updated description' };
    const updateEventResponse = await axios.put(`${BASE_URL}/events/${eventId}`, updatedEvent, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ UPDATE Event successful:', updateEventResponse.data);

    // 7. Test GET Users
    console.log('\n7. Testing GET Users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ GET Users successful:', usersResponse.data);

    // 8. Test UPDATE User
    console.log('\n8. Testing UPDATE User...');
    const updatedUser = { name: 'Updated Admin', email: 'updated@test.com' };
    const updateUserResponse = await axios.put(`${BASE_URL}/users/${userId}`, updatedUser, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ UPDATE User successful:', updateUserResponse.data);

    // 9. Test DELETE Event
    console.log('\n9. Testing DELETE Event...');
    const deleteEventResponse = await axios.delete(`${BASE_URL}/events/${eventId}`, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ DELETE Event successful:', deleteEventResponse.data);

    // 10. Test DELETE User
    console.log('\n10. Testing DELETE User...');
    const deleteUserResponse = await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: {
        'Cookie': `token=${authToken}`
      },
      withCredentials: true
    });
    console.log('✅ DELETE User successful:', deleteUserResponse.data);

    console.log('\n🎉 All Admin CRUD Operations Tested Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testAdminCRUD();
