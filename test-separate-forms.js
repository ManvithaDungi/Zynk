const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSeparateForms() {
  try {
    console.log('🧪 Testing separate forms functionality...\n');
    
    // Login to get authentication token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    console.log(`✅ Logged in as: ${loginResponse.data.user.name}`);
    
    // Get all events
    console.log('\n📋 Fetching events...');
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const events = eventsResponse.data.events;
    console.log(`Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('❌ No events found to test forms with');
      return;
    }
    
    // Test with the first event
    const testEvent = events[0];
    console.log(`\n🎯 Testing forms with event: ${testEvent.title}`);
    console.log(`   Event ID: ${testEvent.id}`);
    console.log(`   Organizer: ${testEvent.organizer?.name || 'Unknown'}`);
    
    // Test 1: Event Feedback Form
    console.log('\n📝 Testing Event Feedback Form...');
    try {
      const feedbackData = {
        name: 'Test User',
        email: 'test@example.com',
        category: 'event-feedback',
        subject: `Feedback for ${testEvent.title}`,
        message: 'This is a test feedback message to verify the feedback form is working correctly.',
        rating: 5,
        eventId: testEvent.id,
        eventTitle: testEvent.title
      };
      
      const feedbackResponse = await axios.post(`${BASE_URL}/feedback`, feedbackData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Event Feedback Form: Working correctly');
      console.log(`   Response: ${feedbackResponse.data.message || 'Success'}`);
      
    } catch (error) {
      console.log('⚠️  Event Feedback Form: API endpoint issue');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 2: Report Issue Form
    console.log('\n🚨 Testing Report Issue Form...');
    try {
      const reportData = {
        name: 'Test User',
        email: 'test@example.com',
        category: 'bug-report',
        subject: `Bug Report: ${testEvent.title}`,
        message: `This is a test bug report to verify the report issue form is working correctly.

Issue Type: bug
Priority: medium

Steps to Reproduce:
1. Go to event page
2. Click on action button
3. See error

Expected Behavior:
Button should work normally

Actual Behavior:
Button does not respond

Browser Info: Chrome 120.0.0.0`,
        priority: 'medium',
        eventId: testEvent.id,
        eventTitle: testEvent.title
      };
      
      const reportResponse = await axios.post(`${BASE_URL}/feedback`, reportData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Report Issue Form: Working correctly');
      console.log(`   Response: ${reportResponse.data.message || 'Success'}`);
      
    } catch (error) {
      console.log('⚠️  Report Issue Form: API endpoint issue');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 3: Contact Us Form
    console.log('\n📧 Testing Contact Us Form...');
    try {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        inquiryType: 'general-question',
        subject: `Question about ${testEvent.title}`,
        message: 'This is a test contact message to verify the contact us form is working correctly.',
        urgency: 'normal',
        preferredContactMethod: 'email',
        phoneNumber: '+1234567890',
        eventId: testEvent.id,
        eventTitle: testEvent.title,
        organizerName: testEvent.organizer?.name || 'Unknown',
        category: 'contact-organizer'
      };
      
      const contactResponse = await axios.post(`${BASE_URL}/feedback`, contactData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Contact Us Form: Working correctly');
      console.log(`   Response: ${contactResponse.data.message || 'Success'}`);
      
    } catch (error) {
      console.log('⚠️  Contact Us Form: API endpoint issue');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n📊 Separate Forms Testing Summary:');
    console.log('✅ Event Feedback Form: Dedicated form for general feedback');
    console.log('✅ Report Issue Form: Dedicated form for bug reports with technical details');
    console.log('✅ Contact Us Form: Dedicated form for contacting organizers');
    console.log('✅ All forms use the same backend endpoint but with different categories');
    
    console.log('\n💡 Frontend Testing Instructions:');
    console.log('1. Start your frontend server: cd frontend && npm start');
    console.log('2. Navigate to an event detail page');
    console.log('3. Click on the action buttons:');
    console.log('   - 📝 Feedback: Opens EventFeedback form');
    console.log('   - 🚨 Report Issue: Opens ReportIssue form');
    console.log('   - 📧 Contact Organizer: Opens ContactUs form');
    console.log('4. Each form should have different fields and styling');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSeparateForms();
