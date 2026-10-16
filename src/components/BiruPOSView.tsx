import React, { useState, useMemo, useCallback } from 'react';
import {
  X, Plus, Minus, Trash2, Sparkles,
  ArrowRight, ChevronRight, ShoppingBag, Clock, Utensils
} from 'lucide-react';
import { ProductoElaborado, ProductoReventa, CartItem, MarcaInfo } from '../types/food';
import { triggerHaptic } from '../utils/haptics';

interface BiruPOSViewProps {
  isOpen: boolean;
  platos: ProductoElaborado[];
  reventa: ProductoReventa[];
  cart: CartItem[];
  marca?: MarcaInfo;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onQuickAdd: (plato: ProductoElaborado) => void;
  onQuickAddReventa: (r: ProductoReventa) => void;
  onSelectPlatoParaPersonalizar: (plato: ProductoElaborado) => void;
  onOpenCheckout: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'todos': '✨',
  'Hamburguesas': '🍔',
  'Burgers': '🍔',
  'Pizzas': '🍕',
  'Tablas': '🧀',
  'Picadas': '🥓',
  'Milanesas': '🥩',
  'Papas': '🍟',
  'Fritos': '🍟',
  'Sandwiches': '🥪',
  'Chivitos': '🥩',
  'Bebidas': '🥤',
  'Cervezas': '🍺',
  'Tragos': '🍸',
  'Cocktails': '🍹',
  'Postres': '🍨',
  'Acompañamientos': '🍟',
};

export const BiruPOSView: React.FC<BiruPOSViewProps> = ({
  isOpen,
  platos,
  reventa,
  cart,
  marca,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onQuickAdd,
  onQuickAddReventa,
  onSelectPlatoParaPersonalizar,
  onOpenCheckout,
}) => {
  const [categoria, setCategoria] = useState('todos');
  const [mobileTab, setMobileTab] = useState<'menu' | 'pedido'>('menu');

  const categorias = useMemo(() => {
    const list = Array.from(new Set(platos.map(p => p.categoria || 'Hamburguesas')));
    if (reventa.length > 0 && !list.includes('Bebidas')) list.push('Bebidas');
    return ['todos', ...list];
  }, [platos, reventa]);

  const platosFiltrados = useMemo(() => {
    if (categoria === 'todos') return platos;
    if (categoria === 'Bebidas') return [];
    return platos.filter(p => p.categoria === categoria);
  }, [platos, categoria]);

  const reventaFiltrada = useMemo(() => {
    return (categoria === 'todos' || categoria === 'Bebidas') ? reventa : [];
  }, [reventa, categoria]);

  const cartTotal = useMemo(() =>
    cart.reduce((a, i) => a + i.precio_unitario * i.cantidad, 0),
    [cart]
  );
  const cartCount = useMemo(() =>
    cart.reduce((a, i) => a + i.cantidad, 0),
    [cart]
  );

  // Lista plana para carrusel horizontal en mobile (upsell)
  const allProductsForScroller = useMemo(() => {
    const platosSugg = platos.slice(0, 10);
    const reventaSugg = reventa.slice(0, 6);
    return { platosSugg, reventaSugg };
  }, [platos, reventa]);

  const handleQuickAdd = useCallback((plato: ProductoElaborado) => {
    triggerHaptic('light');
    if (plato.es_personalizable) {
      onSelectPlatoParaPersonalizar(plato);
    } else {
      onQuickAdd(plato);
    }
  }, [onQuickAdd, onSelectPlatoParaPersonalizar]);

  if (!isOpen) return null;

  return (
    <div className="pos-backdrop" onClick={onClose}>
      <div className="pos-modal" onClick={e => e.stopPropagation()}>

        {/* ═══════════════════════════════════════════════════
            DESKTOP LAYOUT (≥769px): Experiencia POS completa
            ═══════════════════════════════════════════════════ */}

        {/* Header único unificado — Tu Pedido Biru */}
        <div className="pos-header">
          <div className="pos-header-brand">
            <img src="/logo_biru.jpg" alt="Biru Bar" className="pos-header-logo" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pos-header-title">Tu Pedido Biru</span>
                {cartCount > 0 && (
                  <span className="mcart-count-badge">{cartCount}</span>
                )}
              </div>
              <div className="pos-header-delivery">
                <Clock size={12} />
                <span>Delivery y Retiro en Tacuarembó · {marca?.tiempo_espera_delivery || '30–45 min'}</span>
              </div>
            </div>
          </div>
          <div className="pos-header-actions">
            <div className="mcart-status-badge">
              <span className="mcart-status-dot" />
              Abierto ahora
            </div>
            <button onClick={onClose} className="pos-close-btn" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mobile tab switcher — fallback */}
        <div className="pos-mobile-tabs">
          <button
            className={`pos-mobile-tab ${mobileTab === 'menu' ? 'active' : ''}`}
            onClick={() => setMobileTab('menu')}
          >
            🍔 Menú
          </button>
          <button
            className={`pos-mobile-tab ${mobileTab === 'pedido' ? 'active' : ''}`}
            onClick={() => setMobileTab('pedido')}
          >
            <span>🛒 Pedido{cartCount > 0 ? ` (${cartCount})` : ''}</span>
          </button>
        </div>

        {/* ── Desktop Body: Menú a la izquierda + Carrito a la derecha ── */}
        <div className="pos-body">

          {/* ─── Panel Izquierdo: Menú Completo ─────────────────── */}
          <div className={`pos-menu-wrapper ${mobileTab !== 'menu' ? 'pos-hidden-mobile' : ''}`}>
            <div className="pos-menu-panel">
              {/* Barra de Categorías */}
              <div className="pos-categories-bar">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    className={`pos-cat-btn ${categoria === cat ? 'active' : ''}`}
                    onClick={() => setCategoria(cat)}
                  >
                    <span>{CATEGORY_EMOJIS[cat] || '🍽️'}</span>
                    <span>{cat === 'todos' ? 'Todos' : cat}</span>
                  </button>
                ))}
              </div>

              {/* Grilla de Productos */}
              <div className="pos-products-grid">
                {/* Platos elaborados */}
                {platosFiltrados.map(plato => (
                  <div
                    key={plato.producto_elaborado_id}
                    className={`pos-product-card pos-product-card--clickable ${plato.es_personalizable ? 'pos-product-card--armar' : ''}`}
                    onClick={() => handleQuickAdd(plato)}
                    title={plato.es_personalizable ? 'Personalizar pedido' : 'Agregar al pedido'}
                  >
                    <div className="pos-product-img-wrapper">
                      <img
                        src={plato.imagen_url || '/hero_burger.png'}
                        alt={plato.nombre}
                        className="pos-product-img"
                        loading="lazy"
                      />
                      <span className="pos-product-cat-badge">
                        {CATEGORY_EMOJIS[plato.categoria] || '🍽️'} {plato.categoria}
                      </span>
                      {plato.es_personalizable && (
                        <span className="pos-product-armar-badge">
                          <Sparkles size={10} /> Personalizar
                        </span>
                      )}
                    </div>
                    <div className="pos-product-body">
                      <h4 className="pos-product-name">{plato.nombre}</h4>
                      <div className="pos-product-footer">
                        <span className="pos-product-price">
                          ${Number(plato.precio_venta).toLocaleString()} UYU
                        </span>
                        <span className={plato.es_personalizable ? 'pos-tap-hint pos-tap-hint--armar' : 'pos-tap-hint'}>
                          {plato.es_personalizable ? <><Sparkles size={11} /> Armar</> : <><Plus size={11} /> Agregar</>}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bebidas y productos de reventa */}
                {reventaFiltrada.map(r => (
                  <div
                    key={`rev_${r.producto_reventa_id}`}
                    className="pos-product-card pos-product-card--clickable"
                    onClick={() => { triggerHaptic('light'); onQuickAddReventa(r); }}
                    title="Agregar bebida"
                  >
                    <div className="pos-product-img-wrapper">
                      <img
                        src={r.imagen_url || '/hero_burger.png'}
                        alt={r.nombre}
                        className="pos-product-img"
                        loading="lazy"
                      />
                      <span className="pos-product-cat-badge bebida">
                        🥤 Bebidas
                      </span>
                    </div>
                    <div className="pos-product-body">
                      <h4 className="pos-product-name">{r.nombre}</h4>
                      <div className="pos-product-footer">
                        <span className="pos-product-price">
                          ${Number(r.precio_venta).toLocaleString()} UYU
                        </span>
                        <span className="pos-tap-hint">
                          <Plus size={11} /> Agregar
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Panel Derecho: Carrito (DESKTOP) ──────────────── */}
          <div className={`pos-cart-wrapper ${mobileTab !== 'pedido' ? 'pos-hidden-mobile' : ''}`}>
            <div className="pos-cart-panel">
              <div className="pos-cart-header">
                <img src="/logo_biru.jpg" alt="Biru" className="pos-cart-header-logo" />
                <span>Tu Pedido</span>
                {cartCount > 0 && (
                  <span className="pos-cart-badge">{cartCount}</span>
                )}
              </div>

              <div className="pos-cart-items">
                {cart.length === 0 ? (
                  <div className="pos-cart-empty">
                    <span style={{ fontSize: '2.4rem' }}>🍔</span>
                    <p>Tu pedido está vacío</p>
                    <span>Elegí tus burgers, pizzas o bebidas a la izquierda</span>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="pos-cart-item">
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="pos-cart-item-img"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div className="pos-cart-item-info">
                        <p className="pos-cart-item-name">{item.nombre}</p>
                        {item.modificadores && item.modificadores.length > 0 && (
                          <p className="pos-cart-item-mods">
                            {item.modificadores.slice(0, 2).map(m => m.nombre).join(', ')}
                            {item.modificadores.length > 2 && ` +${item.modificadores.length - 2}`}
                          </p>
                        )}
                        <p className="pos-cart-item-price">
                          ${(item.precio_unitario * item.cantidad).toLocaleString()} UYU
                        </p>
                      </div>
                      <div className="pos-cart-item-controls">
                        <button
                          className="pos-qty-btn"
                          onClick={() => { triggerHaptic('light'); onUpdateQty(item.id, -1); }}
                          aria-label="Quitar"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="pos-qty-num">{item.cantidad}</span>
                        <button
                          className="pos-qty-btn"
                          onClick={() => { triggerHaptic('light'); onUpdateQty(item.id, 1); }}
                          aria-label="Agregar"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          className="pos-remove-btn"
                          onClick={() => { triggerHaptic('medium'); onRemoveItem(item.id); }}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Cart Footer */}
              {cart.length > 0 && (
                <div className="pos-cart-footer">
                  <div className="pos-cart-total-row">
                    <span>Total estimado</span>
                    <strong>${cartTotal.toLocaleString()} UYU</strong>
                  </div>
                  <button
                    className="pos-checkout-btn"
                    onClick={() => { triggerHaptic('medium'); onOpenCheckout(); }}
                  >
                    <span>Continuar al Pago</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile bottom bar (si está en pestaña menú) */}
        {mobileTab === 'menu' && cartCount > 0 && (
          <div className="pos-mobile-cart-bar" onClick={() => setMobileTab('pedido')}>
            <span>{cartCount} {cartCount === 1 ? 'ítem' : 'ítems'} · ${cartTotal.toLocaleString()} UYU</span>
            <span className="pos-mobile-cart-bar-action">
              Ver pedido <ChevronRight size={16} />
            </span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            MOBILE CART VIEW (≤768px)
            Vista completa de carrito con carrusel de upsell
            ═══════════════════════════════════════════════════ */}
        <div className="mobile-cart-fullview">

          {/* Contenido scrolleable de móvil */}
          <div className="mcart-scroll-body">

            {/* ── Lista de ítems en carrito ── */}
            {cart.length === 0 ? (
              <div className="mcart-empty-state">
                <ShoppingBag size={42} strokeWidth={1.5} color="var(--accent-gold)" />
                <p className="mcart-empty-title">Tu pedido está vacío</p>
                <span className="mcart-empty-sub">Elegí tus favoritos abajo para empezar ↓</span>
              </div>
            ) : (
              <div className="mcart-items-section">
                <div className="mcart-section-header">
                  <span className="mcart-section-label">PRODUCTOS AÑADIDOS</span>
                  <button
                    className="mcart-clear-btn"
                    onClick={() => { triggerHaptic('medium'); cart.forEach(i => onRemoveItem(i.id)); }}
                  >
                    Vaciar
                  </button>
                </div>

                <div className="mcart-items-list">
                  {cart.map(item => (
                    <div key={item.id} className="mcart-item-card">
                      <div className="mcart-item-inner">
                        {/* Thumbnail */}
                        {item.imagen_url ? (
                          <img
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="mcart-item-thumb"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="mcart-item-thumb mcart-item-thumb--placeholder">🍔</div>
                        )}

                        {/* Info */}
                        <div className="mcart-item-info">
                          {item.modificadores && item.modificadores.length > 0 ? (
                            <span className="mcart-item-badge mcart-item-badge--custom">✨ Personalizado</span>
                          ) : (
                            <span className="mcart-item-badge">
                              {item.categoria === 'Bebidas' ? '🥤 Bebida' : (CATEGORY_EMOJIS[item.categoria] || '🍔') + ' ' + (item.categoria || 'Plato')}
                            </span>
                          )}
                          <h3 className="mcart-item-name">{item.nombre}</h3>
                          {item.modificadores && item.modificadores.length > 0 && (
                            <p className="mcart-item-mods">
                              {item.modificadores.slice(0, 3).map(m => m.nombre).join(', ')}
                              {item.modificadores.length > 3 && ` +${item.modificadores.length - 3} más`}
                            </p>
                          )}
                          <div className="mcart-item-footer">
                            <span className="mcart-item-price">
                              ${(item.precio_unitario * item.cantidad).toLocaleString()} UYU
                            </span>
                            <div className="mcart-item-actions">
                              {/* Stepper */}
                              <div className="mcart-qty-row">
                                <button
                                  className="mcart-qty-btn"
                                  onClick={() => { triggerHaptic('light'); onUpdateQty(item.id, -1); }}
                                  aria-label="Quitar uno"
                                >–</button>
                                <span className="mcart-qty-num">{item.cantidad}</span>
                                <button
                                  className="mcart-qty-btn"
                                  onClick={() => { triggerHaptic('light'); onUpdateQty(item.id, 1); }}
                                  aria-label="Agregar uno"
                                >+</button>
                              </div>
                              {/* Eliminar */}
                              <button
                                className="mcart-remove-btn"
                                onClick={() => { triggerHaptic('medium'); onRemoveItem(item.id); }}
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Carrusel Horizontal de Upsell / Agregar Productos Directo ── */}
            <div className="mcart-upsell-section">
              <div className="mcart-upsell-header">
                <span className="mcart-upsell-title">¿Querés agregar algo más?</span>
                <span className="mcart-upsell-sub">Deslizá →</span>
              </div>

              <div className="mcart-upsell-scroller">
                {/* Platos */}
                {allProductsForScroller.platosSugg.map(plato => (
                  <button
                    key={`upsell_${plato.producto_elaborado_id}`}
                    className={`mcart-upsell-card ${plato.es_personalizable ? 'mcart-upsell-card--armar' : ''}`}
                    onClick={() => handleQuickAdd(plato)}
                  >
                    <div className="mcart-upsell-img-wrap">
                      <img
                        src={plato.imagen_url || '/hero_burger.png'}
                        alt={plato.nombre}
                        className="mcart-upsell-img"
                        loading="lazy"
                      />
                      {plato.es_personalizable && (
                        <span className="mcart-upsell-spark"><Sparkles size={9} /></span>
                      )}
                    </div>
                    <div className="mcart-upsell-body">
                      <span className="mcart-upsell-cat">
                        {plato.es_personalizable ? '✨ Personalizable' : (CATEGORY_EMOJIS[plato.categoria] || '🍔') + ' ' + (plato.categoria || 'Plato')}
                      </span>
                      <p className="mcart-upsell-name">{plato.nombre}</p>
                      <p className="mcart-upsell-price">${Number(plato.precio_venta).toLocaleString()} UYU</p>
                    </div>
                    <div className="mcart-upsell-add-row">
                      <span className="mcart-upsell-add-btn">
                        {plato.es_personalizable ? '✦ Armar' : '+ Agregar'}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Bebidas */}
                {allProductsForScroller.reventaSugg.map(r => (
                  <button
                    key={`upsell_rev_${r.producto_reventa_id}`}
                    className="mcart-upsell-card"
                    onClick={() => { triggerHaptic('light'); onQuickAddReventa(r); }}
                  >
                    <div className="mcart-upsell-img-wrap">
                      <img
                        src={r.imagen_url || '/hero_burger.png'}
                        alt={r.nombre}
                        className="mcart-upsell-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="mcart-upsell-body">
                      <span className="mcart-upsell-cat mcart-upsell-cat--drink">🥤 Bebidas</span>
                      <p className="mcart-upsell-name">{r.nombre}</p>
                      <p className="mcart-upsell-price">${Number(r.precio_venta).toLocaleString()} UYU</p>
                    </div>
                    <div className="mcart-upsell-add-row">
                      <span className="mcart-upsell-add-btn mcart-upsell-add-btn--drink">+ Agregar</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Resumen del pedido ── */}
            {cart.length > 0 && (
              <div className="mcart-summary-card">
                <h3 className="mcart-summary-title">Resumen</h3>
                <div className="mcart-summary-row">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'ítem' : 'ítems'})</span>
                  <span>${cartTotal.toLocaleString()} UYU</span>
                </div>
                <div className="mcart-summary-row mcart-summary-row--note">
                  <span>Envío / Retiro</span>
                  <span>{marca?.costo_delivery !== undefined ? (Number(marca.costo_delivery) === 0 ? 'Envío gratis' : `+$${marca.costo_delivery} UYU`) : 'Se confirma en el checkout'}</span>
                </div>
                <div className="mcart-summary-divider" />
                <div className="mcart-summary-row mcart-summary-total">
                  <span>Total estimado</span>
                  <strong>${cartTotal.toLocaleString()} UYU</strong>
                </div>
              </div>
            )}

            <p className="mcart-note">Podrás agregar notas o aclaraciones de cocina en el siguiente paso.</p>

            {/* Espaciador inferior para no tapar el footer sticky */}
            <div style={{ height: cart.length > 0 ? 110 : 24 }} />
          </div>

          {/* ── Footer Sticky Inferior en Móvil ── */}
          {cart.length > 0 && (
            <div className="mcart-sticky-footer">
              <div className="mcart-footer-total-row">
                <span className="mcart-footer-total-label">Total</span>
                <span className="mcart-footer-total-amount">${cartTotal.toLocaleString()} UYU</span>
              </div>
              <button
                className="mcart-checkout-btn"
                onClick={() => { triggerHaptic('medium'); onOpenCheckout(); }}
              >
                <span>Confirmar Pedido</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
