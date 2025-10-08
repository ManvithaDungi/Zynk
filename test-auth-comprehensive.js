#!/usr/bin/env node

/**
 * Comprehensive Authentication Test Suite
 * Tests all authentication routes and functionality
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}${message ? ` - ${message}` : ''}`);
  
  testResults.tests.push({ name: testName, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      data: error.response?.data, 
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    };
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  
  const result = await makeRequest('GET', '/health');
  const passed = result.success && result.status === 200;
  
  logTest('Health Check', passed, result.message || 'Server is running');
  return passed;
}

// Test 2: User Registration
async function testUserRegistration() {
  console.log('\n🔍 Testing User Registration...');
  
  // Test valid registration
  const validResult = await makeRequest('POST', '/auth/register', TEST_USER);
  const validPassed = validResult.success && validResult.status === 201;
  logTest('Valid Registration', validPassed, validResult.message);
  
  // Test duplicate registration
  const duplicateResult = await makeRequest('POST', '/auth/register', TEST_USER);
  const duplicatePassed = !duplicateResult.success && duplicateResult.status === 400;
  logTest('Duplicate Registration Prevention', duplicatePassed, duplicateResult.message);
  
  // Test invalid email
  const invalidEmailResult = await makeRequest('POST', '/auth/register', {
    ...TEST_USER,
    email: 'invalid-email'
  });
  const invalidEmailPassed = !invalidEmailResult.success && invalidEmailResult.status === 400;
  logTest('Invalid Email Validation', invalidEmailPassed, invalidEmailResult.message);
  
  // Test short password
  const shortPasswordResult = await makeRequest('POST', '/auth/register', {
    ...TEST_USER,
    email: 'test2@example.com',
    password: '123'
  });
  const shortPasswordPassed = !shortPasswordResult.success && shortPasswordResult.status === 400;
  logTest('Short Password Validation', shortPasswordPassed, shortPasswordResult.message);
  
  return validPassed;
}

// Test 3: User Login
async function testUserLogin() {
  console.log('\n🔍 Testing User Login...');
  
  // Test valid login
  const validResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  const validPassed = validResult.success && validResult.status === 200 && validResult.data.token;
  logTest('Valid Login', validPassed, validResult.message);
  
  // Test invalid credentials
  const invalidResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: 'wrongpassword'
  });
  const invalidPassed = !invalidResult.success && invalidResult.status === 401;
  logTest('Invalid Credentials', invalidPassed, invalidResult.message);
  
  // Test non-existent user
  const nonExistentResult = await makeRequest('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: 'password'
  });
  const nonExistentPassed = !nonExistentResult.success && nonExistentResult.status === 401;
  logTest('Non-existent User', nonExistentPassed, nonExistentResult.message);
  
  return validPassed ? validResult.data.token : null;
}

// Test 4: Get Current User (Protected Route)
async function testGetCurrentUser(token) {
  console.log('\n🔍 Testing Get Current User...');
  
  if (!token) {
    logTest('Get Current User (No Token)', false, 'No token available');
    return false;
  }
  
  // Test with valid token
  const validResult = await makeRequest('GET', '/auth/me', null, token);
  const validPassed = validResult.success && validResult.status === 200 && validResult.data.user;
  logTest('Get Current User (Valid Token)', validPassed, validResult.message);
  
  // Test without token
  const noTokenResult = await makeRequest('GET', '/auth/me');
  const noTokenPassed = !noTokenResult.success && noTokenResult.status === 401;
  logTest('Get Current User (No Token)', noTokenPassed, noTokenResult.message);
  
  // Test with invalid token
  const invalidTokenResult = await makeRequest('GET', '/auth/me', null, 'invalid-token');
  const invalidTokenPassed = !invalidTokenResult.success && invalidTokenResult.status === 401;
  logTest('Get Current User (Invalid Token)', invalidTokenPassed, invalidTokenResult.message);
  
  return validPassed;
}

// Test 5: Token Refresh
async function testTokenRefresh(token) {
  console.log('\n🔍 Testing Token Refresh...');
  
  if (!token) {
    logTest('Token Refresh (No Token)', false, 'No token available');
    return false;
  }
  
  const result = await makeRequest('POST', '/auth/refresh', null, token);
  const passed = result.success && result.status === 200 && result.data.token;
  logTest('Token Refresh', passed, result.message);
  
  return passed ? result.data.token : token;
}

// Test 6: Logout
async function testLogout(token) {
  console.log('\n🔍 Testing Logout...');
  
  if (!token) {
    logTest('Logout (No Token)', false, 'No token available');
    return false;
  }
  
  const result = await makeRequest('POST', '/auth/logout', null, token);
  const passed = result.success && result.status === 200;
  logTest('Logout', passed, result.message);
  
  return passed;
}

// Test 7: Protected Route Access
async function testProtectedRoutes(token) {
  console.log('\n🔍 Testing Protected Routes...');
  
  // Test events route (should be protected)
  const eventsResult = await makeRequest('GET', '/events', null, token);
  const eventsPassed = eventsResult.success && eventsResult.status === 200;
  logTest('Protected Events Route', eventsPassed, eventsResult.message);
  
  // Test events route without token
  const eventsNoTokenResult = await makeRequest('GET', '/events');
  const eventsNoTokenPassed = !eventsNoTokenResult.success && eventsNoTokenResult.status === 401;
  logTest('Protected Events Route (No Token)', eventsNoTokenPassed, eventsNoTokenResult.message);
  
  return eventsPassed;
}

// Test 8: Rate Limiting
async function testRateLimiting() {
  console.log('\n🔍 Testing Rate Limiting...');
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest('POST', '/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    }));
  }
  
  const results = await Promise.all(promises);
  const rateLimited = results.some(result => result.status === 429);
  logTest('Rate Limiting', rateLimited, rateLimited ? 'Rate limit triggered' : 'Rate limit not triggered');
  
  return true; // Rate limiting is hard to test reliably
}

// Test 9: JWT Token Structure
async function testJWTStructure(token) {
  console.log('\n🔍 Testing JWT Token Structure...');
  
  if (!token) {
    logTest('JWT Structure (No Token)', false, 'No token available');
    return false;
  }
  
  try {
    const parts = token.split('.');
    const passed = parts.length === 3;
    logTest('JWT Token Structure', passed, passed ? 'Valid JWT format' : 'Invalid JWT format');
    
    if (passed) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const hasUserId = !!payload.userId;
      const hasUsername = !!payload.username;
      const hasExp = !!payload.exp;
      
      logTest('JWT Payload (userId)', hasUserId, hasUserId ? 'Contains userId' : 'Missing userId');
      logTest('JWT Payload (username)', hasUsername, hasUsername ? 'Contains username' : 'Missing username');
      logTest('JWT Payload (exp)', hasExp, hasExp ? 'Contains expiration' : 'Missing expiration');
    }
    
    return passed;
  } catch (error) {
    logTest('JWT Structure', false, 'Error parsing JWT');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Authentication Tests...\n');
  
  try {
    // Run tests in sequence
    await testHealthCheck();
    await testUserRegistration();
    const token = await testUserLogin();
    await testGetCurrentUser(token);
    const refreshedToken = await testTokenRefresh(token);
    await testProtectedRoutes(refreshedToken);
    await testJWTStructure(refreshedToken);
    await testRateLimiting();
    await testLogout(refreshedToken);
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
    }
    
    console.log('\n🎉 Authentication tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testGetCurrentUser,
  testTokenRefresh,
  testLogout,
  testProtectedRoutes,
  testRateLimiting,
  testJWTStructure
};
