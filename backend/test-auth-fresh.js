const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsedBody,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFreshUser() {
  console.log('🚀 Testing with Fresh User...\n');
  
  // Generate unique email
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123';
  
  console.log(`📝 Testing Registration with email: ${testEmail}`);
  const regResult = await makeRequest('POST', '/api/auth/register', {
    name: 'Fresh Test User',
    email: testEmail,
    password: testPassword
  });
  
  if (regResult.success) {
    console.log('✅ Registration successful!');
    console.log('   Token:', regResult.data.token.substring(0, 20) + '...');
    console.log('   User ID:', regResult.data.user.id);
    
    // Test login with the same credentials
    console.log('\n🔐 Testing Login with same credentials...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    
    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log('   Token:', loginResult.data.token.substring(0, 20) + '...');
      
      // Test profile endpoint
      console.log('\n👤 Testing Profile endpoint...');
      const profileResult = await makeRequest('GET', '/api/auth/me', null, loginResult.data.token);
      
      if (profileResult.success) {
        console.log('✅ Profile retrieved successfully!');
        console.log('   User:', profileResult.data.user.name, profileResult.data.user.email);
      } else {
        console.log('❌ Profile failed:', profileResult.status, profileResult.data);
      }
    } else {
      console.log('❌ Login failed:', loginResult.status, loginResult.data);
    }
  } else {
    console.log('❌ Registration failed:', regResult.status, regResult.data);
  }
}

// Helper function to make authenticated requests
async function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsedBody,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

testFreshUser().catch(console.error);
