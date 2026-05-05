import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const checkBlocked = () => {
  if (typeof window === 'undefined') return false;
  const href = window.location.href.toLowerCase();
  if (href.includes('qualcomm.site')) return true;
  try {
    if (window.top !== window.self) {
      const referrer = document.referrer.toLowerCase();
      if (referrer.includes('qualcomm.site')) return true;
    }
  } catch (e) {
    // Cross-origin iframe frame access can throw, meaning it's framed. 
    // We cannot read parent url reliably if cross-origin, but we do our best.
  }
  return false;
};

const isBlocked = checkBlocked();

if (isBlocked) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#000', color: 'red', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1>Accès refusé.<br/>Ce domaine ou cette application a été désactivé.</h1>
      </div>
    );
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  }
} else {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}
