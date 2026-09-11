import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Block old domains and redirect to the new one
if (typeof window !== 'undefined') {
  const host = window.location.hostname.toLowerCase();
  if (host.includes('qualcomm.site')) {
    window.location.href = 'https://soleil-power.xyz' + window.location.pathname + window.location.search;
  }
}

// Register service worker for Cargill PWA auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Graceful fallback if sw.js is not present in dev mode
    });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

