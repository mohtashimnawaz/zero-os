import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp';
import './index.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Starting ZeroOS...');

root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
