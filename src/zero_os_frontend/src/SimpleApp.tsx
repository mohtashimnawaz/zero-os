import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔗 ZeroOS - Loading...</h1>
      <p>If you see this message, React is working correctly!</p>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>React: Working ✅</li>
          <li>TypeScript: Working ✅</li>
          <li>Vite: Working ✅</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleApp;
