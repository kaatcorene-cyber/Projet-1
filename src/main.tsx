import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (window.location.hostname.toLowerCase().includes('qualcomm.site')) {
  document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:red;font-family:sans-serif;text-align:center;padding:20px;"><h1>Accès refusé.<br/>Ce domaine (Qualcomm.site) a été désactivé.</h1></div>';
  throw new Error("Domaine non autorisé");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
