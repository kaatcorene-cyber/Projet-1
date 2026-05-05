import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
const isBlocked = hostname.includes('qualcomm.site');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);

  if (isBlocked) {
    root.render(
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: 'red', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1>Accès refusé.<br/>Ce domaine (Qualcomm.site) a été désactivé.</h1>
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
