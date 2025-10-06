import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const TestLogin = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await authAPI.login('test@example.com', 'TestPassword123');
      setResult(`✅ Login successful! User: ${response.data.user.name}`);
    } catch (error) {
      setResult(`❌ Login failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const timestamp = Date.now();
      const response = await authAPI.register(
        `Test User ${timestamp}`,
        `test${timestamp}@example.com`,
        'TestPassword123'
      );
      setResult(`✅ Registration successful! User: ${response.data.user.name}`);
    } catch (error) {
      setResult(`❌ Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    setResult('Testing profile...');
    
    try {
      const response = await authAPI.getMe();
      setResult(`✅ Profile retrieved! User: ${response.data.user.name}`);
    } catch (error) {
      setResult(`❌ Profile failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Authentication Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} disabled={loading} style={{ marginRight: '10px' }}>
          Test Login
        </button>
        <button onClick={testRegister} disabled={loading} style={{ marginRight: '10px' }}>
          Test Register
        </button>
        <button onClick={testProfile} disabled={loading}>
          Test Profile
        </button>
      </div>

      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        minHeight: '50px'
      }}>
        {result}
      </div>
    </div>
  );
};

export default TestLogin;
