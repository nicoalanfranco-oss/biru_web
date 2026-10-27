import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Download, Clock, X, Share2, PlusSquare } from 'lucide-react';
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
  const [showInstall, setShowInstall] = useState(true);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setShowInstall(false);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);
    setIsChromeIOS(ios && /crios/.test(ua));
    setShowInstall(true);

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
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
    if (promptToUse) {
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
    } else {
      setShowIOSModal(true);
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

      {/* Modal Guiado para instalación en iPhone / iPad (sin alert) */}
      {showIOSModal && (
        <div className="modal-backdrop" onClick={() => setShowIOSModal(false)} style={{ zIndex: 9999 }}>
          <div
            className="modal-container"
            style={{ maxWidth: '380px', padding: '24px', textAlign: 'center', position: 'relative', background: '#121620', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)'
              }}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo_biru.jpg"
                alt="Biru Bar & Delivery"
                style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Instalar App en tu {isIOS ? 'iPhone' : 'Dispositivo'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.4 }}>
                Guardá el acceso directo en tu pantalla de inicio para entrar directo y pedir más rápido:
              </p>

              <div
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '0.85rem',
                  marginTop: '4px'
                }}
              >
                {isChromeIOS ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                      <span>Tocá los <strong>tres puntos (...)</strong> abajo a la derecha de Chrome 👇</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusSquare size={16} color="#FBBF24" />
                        <span>Elegí <strong>"Agregar a la pantalla de inicio"</strong></span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>3</span>
                      <span>Tocá <strong>"Agregar"</strong> arriba a la derecha. ¡Listo!</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Share2 size={16} color="#FBBF24" />
                        <span>Tocá el botón <strong>Compartir</strong> en la barra inferior 👇</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusSquare size={16} color="#FBBF24" />
                        <span>Deslizá y elegí <strong>"Agregar a inicio"</strong></span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#8B1E1E', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>3</span>
                      <span>Tocá <strong>"Agregar"</strong> arriba a la derecha. ¡Listo!</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B1E1E, #B91C1C)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
