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

export const Navbar: React.FC<NavbarProps> = ({
  marca,
  tenant,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => {
      setShowInstall(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
      setDeferredPrompt(null);
    } else {
      alert('Para instalar la App de Biru, toca el menú de tu navegador (⋮ o Compartir) y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".');
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
              <span className="navbar-schedule-badge">
                <Clock size={11} />
                <span className="schedule-days-text">{marca.dias_atencion || 'Mar a Dom'}: </span>{marca.horario_atencion || '19:30 a 01:00 hs'}
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
