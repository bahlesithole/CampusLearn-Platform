import React, { useState } from 'react';

function TestConnection() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      console.log('Starting API test...');
      
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(`Success! Status: ${response.status}, Data: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', border: '1px solid #ccc', margin: '20px' }}>
      <h3>API Connection Test</h3>
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5' }}>
        {result}
      </div>
    </div>
  );
}

export default TestConnection;
