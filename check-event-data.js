const axios = require('axios');

async function checkEvent() {
  try {
    console.log('🔍 Checking event data structure...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    const token = loginResponse.data.token;
    
    const response = await axios.get('http://localhost:5000/api/events/68e69e6254f571286782c4f0', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Event data structure:');
    console.log(JSON.stringify(response.data.event, null, 2));
    
    console.log('\n🖼️  Image-related fields:');
    const event = response.data.event;
    console.log('event.thumbnail:', event.thumbnail);
    console.log('event.eventImage:', event.eventImage);
    console.log('event.imagePath:', event.imagePath);
    console.log('event.image:', event.image);
    
    // Check all fields that might contain image info
    Object.keys(event).forEach(key => {
      if (key.toLowerCase().includes('image') || key.toLowerCase().includes('thumbnail') || key.toLowerCase().includes('photo')) {
        console.log(`${key}:`, event[key]);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkEvent();
