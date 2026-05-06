import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const checkAndRender = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPreview = hostname.endsWith('.run.app');
  const isAllowed = hostname === 'soleil-power.xyz' || hostname.endsWith('.soleil-power.xyz');
  
  const isBlocked = !isLocal && !isPreview && !isAllowed;
  if (isBlocked) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }
  return isBlocked;
};

const isBlocked = checkAndRender();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  if (isBlocked) {
    root.render(
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#000', color: 'white', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: 'red', marginBottom: '20px' }}>Accès refusé.</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Cette plateforme a changé d'adresse pour des raisons de sécurité.</p>
        <a href="https://soleil-power.xyz" style={{ background: '#f59e0b', color: '#000', padding: '15px 30px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Aller sur Soleil-Power.xyz
        </a>
      </div>
    );
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

