import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><AppProvider><App /></AppProvider></BrowserRouter></React.StrictMode>
);

// PWA: register the service worker in production builds only (dev server would be confused by it).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      // cache the JS/CSS already loaded on this first visit so the app also opens offline next time
      const urls = performance.getEntriesByType('resource').map(r => r.name).filter(u => u.startsWith(location.origin) && !u.includes('/api/'));
      return caches.open('gm360-v1').then(c => c.addAll(urls));
    }).catch(() => {});
  });
}
