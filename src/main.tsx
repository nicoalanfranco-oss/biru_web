import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkAppVersionAndPurge, cleanVersionQueryParam, isAppReloading } from './utils/versionCheck';

// Limpiar ?_app_v=... de la URL si venimos de una recarga forzada sin caché
cleanVersionQueryParam();

// Verificación inmediata de versión al iniciar
checkAppVersionAndPurge(true).catch(() => {});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para PWA con actualización sin caché HTTP
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // Chequeo forzado inmediato al registrar
        registration.update().catch(() => {});

        // Chequeo al volver al primer plano
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // Chequeo periódico cada 60 segundos en segundo plano
        setInterval(() => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        }, 60 * 1000);

        // Detectar si hay un nuevo Service Worker instalado
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });

    // Recargar automáticamente solo si ya existía un SW previo controlando y no hay otra recarga en curso
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing || isAppReloading()) return;
      refreshing = true;
      checkAppVersionAndPurge(true).then((didReload) => {
        if (!didReload) {
          window.location.reload();
        }
      });
    });
  });
}
