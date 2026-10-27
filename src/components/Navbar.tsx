import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Download, Clock } from 'lucide-react';
import { TenantInfo, MarcaInfo } from '../types/food';

interface NavbarProps {
  marca: MarcaInfo;
  tenant: TenantInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

let globalDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export const Navbar: React.FC<NavbarProps> = ({
  marca,
  tenant,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
  const [showInstall, setShowInstall] = useState(Boolean(globalDeferredPrompt));

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setShowInstall(false);
      return;
    }

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
      setShowInstall(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setShowInstall(false);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (!promptToUse) return;
    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    } catch (err) {
      console.warn('Install error:', err);
    }
  };


  return (
    <header className="navbar-wrapper">
      <div className="page-container">
        <nav className="navbar">
          {/* Logo + Ubicación + Horario */}
          <div className="navbar-left-group">
            <a href="#" className="navbar-brand">
              <img
                src="/logo_biru.jpg"
                alt="Biru Bar & Delivery"
                className="navbar-logo"
              />
            </a>
            <div className="navbar-badges-group">
              <a
                href={tenant?.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent((tenant?.direccion || 'Dr. Domingo Catalina 98') + ', Tacuarembó, Uruguay')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-location-badge navbar-location-link"
                title={`Ver en Google Maps: ${tenant?.direccion || 'Dr. Domingo Catalina 98'}`}
              >
                <MapPin size={11} />
                {/* Dirección abreviada: solo el número de calle */}
                {tenant?.direccion
                  ? tenant.direccion.replace(/^(Dr\.?\s?Domingo\s?)?/i, '').trim()
                  : 'Catalina 98'}
              </a>
              <span className={`navbar-schedule-badge ${marca.estado_atencion ? (marca.estado_atencion.abierto_ahora ? 'navbar-schedule-open' : 'navbar-schedule-closed') : ''}`}>
                {marca.estado_atencion ? (
                  <>
                    <span className={`navbar-status-indicator ${marca.estado_atencion.abierto_ahora ? 'indicator-open' : 'indicator-closed'}`} />
                    <span className={`navbar-status-pill ${marca.estado_atencion.abierto_ahora ? 'open' : 'closed'}`}>
                      {marca.estado_atencion.abierto_ahora ? 'Abierto' : 'Cerrado'}
                    </span>
                    <span className="schedule-days-text">· {marca.estado_atencion.mensaje_estado}</span>
                  </>
                ) : (
                  <>
                    <Clock size={11} />
                    <span className="schedule-days-text">{marca.dias_atencion || 'Mar a Dom'}: </span>{marca.horario_atencion || '19:30 a 01:00 hs'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Botones de acción derecha */}
          <div className="navbar-actions">
            {showInstall && (
              <button
                type="button"
                onClick={handleInstall}
                className="navbar-pwa-pill"
                title="Instalar App Biru"
                aria-label="Instalar app Biru"
              >
                <span className="navbar-pwa-text">App</span>
                <span className="navbar-pwa-install-icon">
                  <Download size={12} />
                </span>
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="cart-button-header"
              aria-label="Ver mi pedido"
            >
              <ShoppingCart size={18} color="var(--accent-gold)" />
              <span className="cart-badge-count">{cartCount}</span>
              {cartTotal > 0 && (
                <span className="cart-total-text">
                  ${cartTotal.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
