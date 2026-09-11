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

// We unregister service workers to avoid old cached versions persisting
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
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

