import { useState } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [result, setResult] = useState('');

  const testDirect = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', 
        { email: 'test@example.com', password: 'test123' },
        { withCredentials: true }
      );
      setResult('SUCCESS: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('ERROR: ' + JSON.stringify({
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data
      }, null, 2));
    }
  };

  const testHealth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      setResult('HEALTH CHECK SUCCESS: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('HEALTH CHECK ERROR: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Connection Test</h1>
      <button onClick={testHealth} style={{ margin: '10px', padding: '10px 20px' }}>
        Test Health Endpoint
      </button>
      <button onClick={testDirect} style={{ margin: '10px', padding: '10px 20px' }}>
        Test Login (Direct)
      </button>
      <pre style={{ background: '#f5f5f5', padding: '20px', marginTop: '20px' }}>
        {result || 'Click a button to test...'}
      </pre>
      <div style={{ marginTop: '20px', background: '#e3f2fd', padding: '15px' }}>
        <h3>Debug Info:</h3>
        <p>Backend URL: http://localhost:5000</p>
        <p>Expected endpoint: http://localhost:5000/api/auth/login</p>
        <p>Test user: test@example.com / test123</p>
      </div>
    </div>
  );
};

export default TestConnection;

