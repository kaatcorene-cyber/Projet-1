import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const checkAndRedirect = () => {
  if (typeof window === 'undefined') return;
  const hostname = window.location.hostname.toLowerCase();
  
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPreview = hostname.endsWith('.run.app');
  const isAllowed = hostname === 'soleil-power.xyz' || hostname.endsWith('.soleil-power.xyz');
  
  // If it's not a local dev, not a google preview, and not the main domain, redirect!
  if (!isLocal && !isPreview && !isAllowed) {
    const redirectUrl = `https://soleil-power.xyz${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(redirectUrl);
  }
};

checkAndRedirect();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
