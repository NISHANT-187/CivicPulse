import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';
import { AUTH_CONFIG, validateAuthConfig } from './config/authConfig';
import './index.css';

// Perform startup auth configuration validation
validateAuthConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={AUTH_CONFIG.CLIENT_ID || 'mock-client-id'}>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
