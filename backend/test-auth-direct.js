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

async function testRegistration() {
  console.log('📝 Testing User Registration...');
  try {
    const result = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (result.success) {
      console.log('✅ Registration successful:', result.data);
      return result.data.token;
    } else {
      console.log('❌ Registration failed:', result.status, result.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const result = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (result.success) {
      console.log('✅ Login successful:', result.data);
      return result.data.token;
    } else {
      console.log('❌ Login failed:', result.status, result.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testProfile(token) {
  console.log('\n👤 Testing User Profile...');
  if (!token) {
    console.log('❌ No token available for profile test');
    return;
  }
  
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const result = await new Promise((resolve, reject) => {
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
      req.end();
    });
    
    if (result.success) {
      console.log('✅ Profile retrieved successfully:', result.data);
    } else {
      console.log('❌ Profile failed:', result.status, result.data);
    }
  } catch (error) {
    console.log('❌ Profile error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  const token = await testRegistration();
  if (token) {
    await testProfile(token);
  }
  
  const loginToken = await testLogin();
  if (loginToken) {
    await testProfile(loginToken);
  }
  
  console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
