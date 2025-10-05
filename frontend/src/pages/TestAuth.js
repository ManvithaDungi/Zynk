import { useState } from 'react';
import { authAPI } from '../utils/api';

const TestAuth = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await authAPI.register('testuser2', 'test2@example.com', 'test123');
      setResult('Register Success: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('Register Error: ' + JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.login('test@example.com', 'test123');
      setResult('Login Success: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('Login Error: ' + JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testMe = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      setResult('Get Me Success: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('Get Me Error: ' + JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Auth API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testRegister} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          Test Register
        </button>
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          Test Login
        </button>
        <button 
          onClick={testMe} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test Get Me
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '5px',
        overflow: 'auto'
      }}>
        {result || 'Click a button to test...'}
      </pre>

      <div style={{ marginTop: '20px', background: '#fff3cd', padding: '15px', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser console (F12) to see detailed logs</li>
          <li>Click "Test Register" to create a test user</li>
          <li>Click "Test Login" to login with the test user</li>
          <li>Click "Test Get Me" to verify authentication</li>
        </ol>
        <p><strong>Expected user:</strong> test@example.com / test123</p>
      </div>
    </div>
  );
};

export default TestAuth;

