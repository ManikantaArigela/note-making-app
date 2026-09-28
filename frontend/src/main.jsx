import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ConnectionProvider } from './context/ConnectionContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import './index.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConnectionProvider>
      <AuthProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </AuthProvider>
    </ConnectionProvider>
  </React.StrictMode>
);

