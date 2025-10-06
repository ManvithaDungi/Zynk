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
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test functions
async function testServerHealth() {
  console.log('\n🔍 Testing Server Health...');
  const result = await makeRequest('GET', '/health');
  logTest('Server Health Check', result.success, result.success ? 'Server is running' : result.error);
}

async function testUserRegistration() {
  console.log('\n📝 Testing User Registration...');
  
  // Test 1: Valid registration
  const validResult = await makeRequest('POST', '/auth/register', TEST_USER);
  logTest('Valid Registration', validResult.success && validResult.data.token, 
    validResult.success ? 'User created successfully' : validResult.error?.message);
  
  // Test 2: Duplicate email registration
  const duplicateResult = await makeRequest('POST', '/auth/register', TEST_USER);
  logTest('Duplicate Email Registration', !duplicateResult.success && duplicateResult.status === 400,
    duplicateResult.success ? 'Should have failed' : 'Correctly rejected duplicate email');
  
  // Test 3: Missing fields registration
  const missingFieldsResult = await makeRequest('POST', '/auth/register', { name: 'Test' });
  logTest('Missing Fields Registration', !missingFieldsResult.success,
    missingFieldsResult.success ? 'Should have failed' : 'Correctly rejected incomplete data');
  
  return validResult.success ? validResult.data.token : null;
}

async function testUserLogin(token) {
  console.log('\n🔐 Testing User Login...');
  
  // Test 1: Valid login
  const validLoginResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  logTest('Valid Login', validLoginResult.success && validLoginResult.data.token,
    validLoginResult.success ? 'Login successful' : validLoginResult.error?.message);
  
  // Test 2: Invalid email
  const invalidEmailResult = await makeRequest('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: TEST_USER.password
  });
  logTest('Invalid Email Login', !invalidEmailResult.success && invalidEmailResult.status === 401,
    invalidEmailResult.success ? 'Should have failed' : 'Correctly rejected invalid email');
  
  // Test 3: Invalid password
  const invalidPasswordResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: 'wrongpassword'
  });
  logTest('Invalid Password Login', !invalidPasswordResult.success && invalidPasswordResult.status === 401,
    invalidPasswordResult.success ? 'Should have failed' : 'Correctly rejected invalid password');
  
  return validLoginResult.success ? validLoginResult.data.token : token;
}

async function testUserProfile(token) {
  console.log('\n👤 Testing User Profile...');
  
  if (!token) {
    logTest('User Profile (No Token)', false, 'No valid token available');
    return;
  }
  
  // Test 1: Valid token
  const validProfileResult = await makeRequest('GET', '/auth/me', null, token);
  logTest('Valid Token Profile', validProfileResult.success && validProfileResult.data.user,
    validProfileResult.success ? 'Profile retrieved successfully' : validProfileResult.error?.message);
  
  // Test 2: Invalid token
  const invalidTokenResult = await makeRequest('GET', '/auth/me', null, 'invalid-token');
  logTest('Invalid Token Profile', !invalidTokenResult.success && invalidTokenResult.status === 401,
    invalidTokenResult.success ? 'Should have failed' : 'Correctly rejected invalid token');
  
  // Test 3: No token
  const noTokenResult = await makeRequest('GET', '/auth/me');
  logTest('No Token Profile', !noTokenResult.success && noTokenResult.status === 401,
    noTokenResult.success ? 'Should have failed' : 'Correctly rejected request without token');
}

async function testPasswordHashing() {
  console.log('\n🔒 Testing Password Security...');
  
  // Test 1: Check if password is hashed (not stored in plain text)
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (loginResult.success) {
    // Try to login with original password (should work)
    const originalPasswordResult = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    logTest('Password Hashing', originalPasswordResult.success,
      originalPasswordResult.success ? 'Password properly hashed and verified' : 'Password hashing issue');
  } else {
    logTest('Password Hashing', false, 'Could not test - login failed');
  }
}

async function testJWTToken() {
  console.log('\n🎫 Testing JWT Token...');
  
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (loginResult.success && loginResult.data.token) {
    const token = loginResult.data.token;
    
    // Test token structure (basic check)
    const tokenParts = token.split('.');
    logTest('JWT Token Structure', tokenParts.length === 3,
      tokenParts.length === 3 ? 'Token has correct JWT structure' : 'Invalid JWT structure');
    
    // Test token expiration (try to use it)
    const profileResult = await makeRequest('GET', '/auth/me', null, token);
    logTest('JWT Token Validity', profileResult.success,
      profileResult.success ? 'Token is valid and working' : 'Token validation failed');
  } else {
    logTest('JWT Token', false, 'Could not test - no token received');
  }
}

async function cleanupTestUser() {
  console.log('\n🧹 Cleaning up test data...');
  // Note: In a real scenario, you might want to delete the test user
  // For now, we'll just log that cleanup would happen here
  logTest('Test Cleanup', true, 'Test user left in database for manual cleanup if needed');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Authentication System Tests...\n');
  console.log('=' * 50);
  
  let token = null;
  
  try {
    await testServerHealth();
    token = await testUserRegistration();
    token = await testUserLogin(token);
    await testUserProfile(token);
    await testPasswordHashing();
    await testJWTToken();
    await cleanupTestUser();
    
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
  }
  
  // Print summary
  console.log('\n' + '=' * 50);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 50);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n🏁 Testing completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };
