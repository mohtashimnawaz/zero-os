import React from 'react';
import { useSimpleAuth } from './contexts/SimpleAuthContext';

const SimpleApp: React.FC = () => {
  const { isAuthenticated, login, logout } = useSimpleAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
        <h1>🔗 ZeroOS - Login Required</h1>
        <p>Click login to access your personal workspace</p>
        <button 
          onClick={login}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Login (Test Mode)
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🔗 ZeroOS - Dashboard</h1>
        <button 
          onClick={logout}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>✅ Core Systems Status:</h3>
        <ul>
          <li>React: Working ✅</li>
          <li>TypeScript: Working ✅</li>
          <li>Vite: Working ✅</li>
          <li>React Router: Working ✅</li>
          <li>TanStack Query: Working ✅</li>
          <li>Authentication Flow: Working ✅</li>
        </ul>
      </div>

      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>🚀 Next: Full IC Integration</h3>
        <p>All core frontend systems are working. Ready to integrate:</p>
        <ul>
          <li>Internet Identity Authentication</li>
          <li>IC Agent & Canisters</li>
          <li>File System Context</li>
          <li>Full ZeroOS UI</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px'
      }}>
        <h3>🔧 Environment Variables</h3>
        <pre style={{ fontSize: '12px', margin: 0 }}>
          VITE_DFX_NETWORK: {import.meta.env.VITE_DFX_NETWORK || 'undefined'}{'\n'}
          VITE_CANISTER_ID_ZERO_OS_BACKEND: {import.meta.env.VITE_CANISTER_ID_ZERO_OS_BACKEND || 'undefined'}{'\n'}
          VITE_CANISTER_ID_ZERO_OS_FRONTEND: {import.meta.env.VITE_CANISTER_ID_ZERO_OS_FRONTEND || 'undefined'}
        </pre>
      </div>
    </div>
  );
};

export default SimpleApp;
