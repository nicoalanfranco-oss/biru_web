import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderStatusBanner } from './components/OrderStatusBanner';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { StoryCultureSection } from './components/StoryCultureSection';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { BiruPOSView } from './components/BiruPOSView';
import { CheckoutModal } from './components/CheckoutModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { ProductoElaborado, ProductoReventa, GrupoOpciones, CartItem, TenantInfo, MarcaInfo } from './types/food';
import { fetchBiruCatalogo, uploadComprobanteTransferencia, TENANT_INFO, MARCA_INFO, REAL_PLATOS, REAL_REVENTA, REAL_GRUPOS } from './services/api';
import { useStructuredData } from './hooks/useStructuredData';
import { CheckCircle2, Sparkles, Bell, ArrowRight, WifiOff, Paperclip, MessageCircle, Copy, Check } from 'lucide-react';
import { triggerHaptic } from './utils/haptics';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const BANCOS_TRANSFERENCIA = [
  {
    nombre: 'BROU',
    logo: '/banks/brou.png',
    url: 'https://ebanking.brou.com.uy/frontend/loginStep1',
  },
  {
    nombre: 'Itaú',
    logo: '/banks/itau.png',
    url: 'https://www.itau.com.uy/inst/',
  },
  {
    nombre: 'Santander',
    logo: '/banks/santander.png',
    url: 'https://www.santander.com.uy/',
  },
  {
    nombre: 'BBVA',
    logo: '/banks/bbva.png',
    url: 'https://bbvanet.bbva.com.uy/NetApp/Home/Index',
  },
  {
    nombre: 'Scotiabank',
    logo: '/banks/scotiabank.png',
    url: 'https://www1.scotiabank.com.uy/scotiaenlinea/',
  },
  {
    nombre: 'Prex',
    logo: '/banks/prex.svg',
    url: 'https://www.prexcard.com/login',
  },
];

export const App: React.FC = () => {
  const [tenant, setTenant] = useState<TenantInfo>(TENANT_INFO);
  const [marca, setMarca] = useState<MarcaInfo>(MARCA_INFO);
  const [platos, setPlatos] = useState<ProductoElaborado[]>(REAL_PLATOS);
  const [reventa, setReventa] = useState<ProductoReventa[]>(REAL_REVENTA);
  const [grupos, setGrupos] = useState<GrupoOpciones[]>(REAL_GRUPOS);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [toast, setToast] = useState<ToastData | null>(null);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [platoPersonalizando, setPlatoPersonalizando] = useState<ProductoElaborado | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<number | null>(null);
  const [orderSuccessPedidoId, setOrderSuccessPedidoId] = useState<number | null>(null);
  const [comprobanteUrlSuccess, setComprobanteUrlSuccess] = useState<string | null>(null);
  const [uploadingComprobanteSuccess, setUploadingComprobanteSuccess] = useState<boolean>(false);
  const [orderWhatsAppUrl, setOrderWhatsAppUrl] = useState<string>('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | null>(null);
  const [copiedPrex, setCopiedPrex] = useState<boolean>(false);

  // Carrito persistido
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('biru_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mobileTab, setMobileTab] = useState<'inicio' | 'menu'>('inicio');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('biru_cart', JSON.stringify(cart));
  }, [cart]);

  // Carga inicial del catálogo desde el backend de Food (Tenant 6, Marca 4)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchBiruCatalogo();
      setPlatos(data.elaborados);
      setReventa(data.reventa || []);
      setGrupos(data.gruposOpciones || []);
      if (data.tenant) setTenant(data.tenant);
      if (data.marca) setMarca(data.marca);
      setLoading(false);
    };
    load();
  }, []);

  useStructuredData({ tenant, marca, platos, reventa });

  const cartCount = cart.reduce((acc, it) => acc + it.cantidad, 0);
  const cartTotal = cart.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);

  const handleSelectPlatoParaPersonalizar = (plato: ProductoElaborado) => {
    setPlatoPersonalizando(plato);
    setIsCustomizerOpen(true);
  };

  const handleAddToCart = (item: CartItem, openDrawer: boolean = false) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        i =>
          i.producto_id === item.producto_id &&
          i.precio_unitario === item.precio_unitario &&
          JSON.stringify(i.modificadores) === JSON.stringify(item.modificadores) &&
          i.notas === item.notas
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].cantidad += item.cantidad;
        return copy;
      }
      return [...prev, item];
    });

    setToast({
      id: `${item.id}_${Date.now()}`,
      title: item.nombre,
      subtitle: item.modificadores && item.modificadores.length > 0
        ? `${item.modificadores.length} opciones personalizadas`
        : '¡Agregado con éxito a tu pedido!',
      image: item.imagen_url || undefined,
      price: item.precio_unitario * item.cantidad,
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const handleQuickAddToCart = (plato: ProductoElaborado) => {
    const cartItem: CartItem = {
      id: `${plato.producto_elaborado_id}_${Date.now()}`,
      producto_id: plato.producto_elaborado_id,
      tipo: 'elaborado',
      nombre: plato.nombre,
      categoria: plato.categoria,
      precio_base: Number(plato.precio_venta),
      precio_unitario: Number(plato.precio_venta),
      cantidad: 1,
      imagen_url: plato.imagen_url || '/hero_burger.png',
      modificadores: [],
    };
    handleAddToCart(cartItem, false);
  };

  const handleQuickAddReventa = (r: ProductoReventa) => {
    const cartItem: CartItem = {
      id: `rev_${r.producto_reventa_id}_${Date.now()}`,
      producto_id: r.producto_reventa_id,
      tipo: 'reventa',
      nombre: r.nombre,
      categoria: r.categoria || 'Cervezas',
      precio_base: Number(r.precio_venta),
      precio_unitario: Number(r.precio_venta),
      cantidad: 1,
      imagen_url: r.imagen_url || '/heladeras_vintage.png',
      modificadores: [],
    };
    handleAddToCart(cartItem, false);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.id === id) {
            const nuevaCant = i.cantidad + delta;
            return nuevaCant > 0 ? { ...i, cantidad: nuevaCant } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleOrderSuccess = (orderNumber: number, whatsappUrl?: string, paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia', pedidoId?: number) => {
    setOrderSuccessNumber(orderNumber);
    setOrderSuccessPedidoId(pedidoId || null);
    setComprobanteUrlSuccess(null);
    setOrderPaymentMethod(paymentMethod || null);
    if (whatsappUrl) setOrderWhatsAppUrl(whatsappUrl);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    if (paymentMethod === 'transferencia') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText('092033390').then(() => {
          setCopiedPrex(true);
        }).catch(() => {});
      } else {
        setCopiedPrex(true);
      }
    } else {
      setCopiedPrex(false);
    }
  };

  const handleCopyAccount = (acc: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(acc);
      setCopiedPrex(true);
      setTimeout(() => setCopiedPrex(false), 2500);
    }
  };

  const handleUploadComprobante = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderSuccessPedidoId) return;

    try {
      setUploadingComprobanteSuccess(true);
      const res = await uploadComprobanteTransferencia(orderSuccessPedidoId, file);
      if (res.success && res.comprobante_url) {
        setComprobanteUrlSuccess(res.comprobante_url);
      }
    } catch (err) {
      console.warn('Error subiendo comprobante:', err);
    } finally {
      setUploadingComprobanteSuccess(false);
    }
  };

  const handleExploreMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileTab('menu');
  };

  return (
    <div className="app-layout biru-app-dark">
      {!isOnline && (
        <div className="offline-toast-bar">
          <WifiOff size={14} />
          <span>Modo offline activado — Podés seguir navegando la carta y armando tu pedido.</span>
        </div>
      )}

      {/* Navbar Superior */}
      <Navbar
        marca={marca}
        tenant={tenant}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Banner de Estado de Pedido Activo */}
      <OrderStatusBanner />

      <main>
        {/* Hero Section */}
        <HeroSection
          marca={marca}
          tenant={tenant}
          onExploreMenu={handleExploreMenu}
        />

        {/* Sección de La Carta */}
        <MenuSection
          platos={platos}
          reventa={reventa}
          grupos={grupos}
          loading={loading}
          onSelectPlatoParaPersonalizar={handleSelectPlatoParaPersonalizar}
          onQuickAddToCart={handleQuickAddToCart}
          onQuickAddReventa={handleQuickAddReventa}
        />

        {/* Sección Mística & Historia Biru */}
        <StoryCultureSection />
      </main>

      {/* Footer */}
      <Footer marca={marca} tenant={tenant} />

      {/* Navegación Inferior Móvil */}
      {!isCustomizerOpen && !isCartOpen && !isCheckoutOpen && !orderSuccessNumber && (
        <MobileBottomNav
          activeTab={mobileTab}
          cartCount={cartCount}
          onNavigate={tab => {
            setMobileTab(tab);
            if (tab === 'inicio') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              handleExploreMenu();
            }
          }}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Notificación Toast Flotante */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Modal de Personalización de Plato */}
      {isCustomizerOpen && (
        <ItemCustomizerModal
          plato={platoPersonalizando}
          grupos={grupos}
          onClose={() => setIsCustomizerOpen(false)}
          onAddToCart={item => handleAddToCart(item, true)}
        />
      )}

      {/* Drawer / POS View de Carrito */}
      {isCartOpen && (
        <BiruPOSView
          isOpen={isCartOpen}
          platos={platos}
          reventa={reventa}
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onQuickAdd={handleQuickAddToCart}
          onQuickAddReventa={handleQuickAddReventa}
          onSelectPlatoParaPersonalizar={plato => {
            setIsCartOpen(false);
            handleSelectPlatoParaPersonalizar(plato);
          }}
          onOpenCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Modal de Checkout */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          items={cart}
          marca={marca}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Modal de Éxito / Confirmación de Pedido */}
      {orderSuccessNumber && (
        <div className="modal-backdrop" onClick={() => setOrderSuccessNumber(null)}>
          <div
            className="modal-container order-success-modal-biru"
            onClick={e => e.stopPropagation()}
          >
            <div className="success-header-row">
              <img src="/logo_biru.jpg" alt="Biru" className="success-brand-logo" />
              <div className="success-badge-confirmed">
                <CheckCircle2 size={16} />
                <span>¡Pedido Recibido!</span>
              </div>
            </div>

            <div className="success-hero-block">
              <span className="success-order-num">Orden #B{orderSuccessNumber}</span>
              <h3 className="success-title">¡Marchando a la cocina!</h3>
              <p className="success-subtitle">
                Ya registramos tu pedido en el sistema de Biru Bar & Delivery.
              </p>
            </div>

            {/* Botón WhatsApp prioritario */}
            {orderWhatsAppUrl && (
              <a
                href={orderWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary success-whatsapp-btn"
              >
                <MessageCircle size={20} />
                <span>Enviar copia a WhatsApp de Biru</span>
              </a>
            )}

            {/* Datos de Transferencia Bancaria si aplica */}
            {orderPaymentMethod === 'transferencia' && (
              <div className="success-bank-section">
                <h4 className="success-bank-title">Datos para Transferencia:</h4>
                <div className="success-bank-card">
                  <div className="bank-card-row">
                    <span>Prex / Banco:</span>
                    <strong>092 033 390 (Biru Bar)</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('092033390')}
                      className="btn-copy-mini"
                    >
                      {copiedPrex ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedPrex ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Subir comprobante */}
                <div className="success-upload-wrapper">
                  <input
                    id="input-comprobante-success"
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleUploadComprobante}
                  />
                  {comprobanteUrlSuccess ? (
                    <div className="comprobante-uploaded-pill">
                      <CheckCircle2 size={14} color="#10B981" />
                      <span>Comprobante adjuntado con éxito ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingComprobanteSuccess}
                      onClick={() => document.getElementById('input-comprobante-success')?.click()}
                      className="btn-upload-comprobante"
                    >
                      <Paperclip size={14} />
                      <span>{uploadingComprobanteSuccess ? 'Subiendo comprobante...' : 'Adjuntar comprobante de pago'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="success-actions-col">
              <a
                href="https://www.instagram.com/birubartbo/"
                target="_blank"
                rel="noreferrer"
                className="success-instagram-btn"
              >
                <InstagramIcon size={18} />
                <span>Seguinos en Instagram @birubartbo</span>
              </a>

              <button
                type="button"
                onClick={() => setOrderSuccessNumber(null)}
                className="btn-secondary success-back-btn"
              >
                Volver a La Carta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
