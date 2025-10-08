const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function deleteAllEvents() {
  try {
    console.log('🗑️  Deleting all existing events...\n');
    
    // Login to get authentication token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    console.log(`✅ Logged in as: ${loginResponse.data.user.name}`);
    
    // Get all events first
    console.log('\n📋 Fetching all events...');
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const events = eventsResponse.data.events;
    console.log(`Found ${events.length} events to delete`);
    
    if (events.length === 0) {
      console.log('✅ No events found to delete');
      return;
    }
    
    // List all events that will be deleted
    console.log('\n📝 Events to be deleted:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
    });
    
    // Delete each event
    console.log('\n🗑️  Deleting events...');
    let deletedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      try {
        console.log(`   Deleting ${i + 1}/${events.length}: ${event.title}...`);
        
        // Note: We need to check if there's a delete endpoint
        // For now, let's try to delete via the event ID
        await axios.delete(`${BASE_URL}/events/${event.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        deletedCount++;
        console.log(`   ✅ Deleted: ${event.title}`);
        
        // Small delay between deletions
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        failedCount++;
        console.log(`   ❌ Failed to delete: ${event.title}`);
        console.log(`      Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n📊 Deletion Summary:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} events`);
    console.log(`   ❌ Failed to delete: ${failedCount} events`);
    console.log(`   📋 Total events processed: ${events.length}`);
    
    if (deletedCount > 0) {
      console.log('\n🎉 Events deletion completed!');
      console.log('💡 You can now create fresh events with proper images');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

deleteAllEvents();
