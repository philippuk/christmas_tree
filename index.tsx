import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const setupOverlay = document.getElementById('setup-overlay');

// If JS executes, we are in a valid environment (server), so hide the warning.
if (setupOverlay) {
  setupOverlay.style.display = 'none';
}

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);