import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Per AI Studio runtime constraints: ignore benign HMR / aborted WebSocket errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event?.message?.toLowerCase() || '';
    if (
      msg.includes('websocket') ||
      msg.includes('closed before') ||
      msg.includes('closed without')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event?.reason?.message || event?.reason || '').toLowerCase();
    if (
      reason.includes('websocket') ||
      reason.includes('closed before') ||
      reason.includes('closed without')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
