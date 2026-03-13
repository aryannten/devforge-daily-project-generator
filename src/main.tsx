/**
 * Main Application Entry Point
 * Initializes React and renders the root App component
 * Requirements: 12.1, 12.4, 14.2
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create React root and render app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
