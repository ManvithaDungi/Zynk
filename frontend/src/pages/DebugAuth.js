import { useState } from 'react';
import axios from 'axios';

const DebugAuth = () => {
  const [logs, setLogs] = useState([]);
  const [email] = useState('test1759653951005@example.com');
  const [password] = useState('Test123456');

  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data);
  };

  const testDirectAxios = async () => {
    setLogs([]);
    addLog('🧪 Testing Direct Axios Call...');

    try {
      addLog('📡 Sending request to: http://localhost:5000/api/auth/login');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      addLog('✅ Login Successful!', response.data);
      addLog('🎫 Token received:', response.data.token?.substring(0, 30) + '...');
      addLog('👤 User data:', response.data.user);

    } catch (error) {
      addLog('❌ Login Failed!', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
  };

  const testWithApiUtil = async () => {
    setLogs([]);
    addLog('🧪 Testing with API Utility...');

    try {
      const { authAPI } = await import('../utils/api');
      addLog('📦 API utility imported successfully');

      const response = await authAPI.login(email, password);
      addLog('✅ Login Successful!', response.data);

    } catch (error) {
      addLog('❌ Login Failed!', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  const testBackendHealth = async () => {
    setLogs([]);
    addLog('🏥 Testing Backend Health...');

    try {
      const response = await axios.get('http://localhost:5000/api/health');
      addLog('✅ Backend is healthy!', response.data);
    } catch (error) {
      addLog('❌ Backend is down!', error.message);
    }
  };

  const testRegister = async () => {
    setLogs([]);
    addLog('🧪 Testing Registration...');

    const testEmail = `test${Date.now()}@example.com`;
    const testData = {
      name: 'Debug Test User',
      email: testEmail,
      password: 'Test123456'
    };

    try {
      addLog('📡 Sending registration request...');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        testData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      addLog('✅ Registration Successful!', response.data);
      addLog('🎫 Token received:', response.data.token?.substring(0, 30) + '...');

    } catch (error) {
      addLog('❌ Registration Failed!', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f0' }}>🔧 Authentication Debug Console</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <button onClick={testBackendHealth} style={buttonStyle}>
          🏥 Test Backend Health
        </button>
        <button onClick={testDirectAxios} style={buttonStyle}>
          🔑 Test Direct Login
        </button>
        <button onClick={testWithApiUtil} style={buttonStyle}>
          📦 Test API Utility Login
        </button>
        <button onClick={testRegister} style={buttonStyle}>
          ✨ Test Registration
        </button>
        <button onClick={() => setLogs([])} style={{ ...buttonStyle, backgroundColor: '#c00' }}>
          🗑️ Clear Logs
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#111', 
        padding: '20px', 
        borderRadius: '8px',
        maxHeight: '70vh',
        overflow: 'auto'
      }}>
        <h3 style={{ color: '#0f0', marginTop: 0 }}>📋 Logs:</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#666' }}>No logs yet. Click a button to start testing.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '15px', 
              padding: '10px',
              backgroundColor: '#000',
              borderLeft: '3px solid #0f0',
              borderRadius: '4px'
            }}>
              <div style={{ color: '#0ff', fontSize: '12px', marginBottom: '5px' }}>
                [{log.timestamp}]
              </div>
              <div style={{ color: '#0f0', fontWeight: 'bold' }}>
                {log.message}
              </div>
              {log.data && (
                <pre style={{ 
                  marginTop: '10px', 
                  color: '#ff0',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#222',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#0f0' }}>ℹ️ Test Credentials:</h3>
        <p style={{ color: '#fff' }}>Email: {email}</p>
        <p style={{ color: '#fff' }}>Password: {password}</p>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: '5px',
  padding: '12px 24px',
  backgroundColor: '#0a0',
  color: '#000',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  fontSize: '14px'
};

export default DebugAuth;

