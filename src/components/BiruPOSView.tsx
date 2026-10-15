import React from 'react';
import {
  X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Utensils
} from 'lucide-react';
import { ProductoElaborado, ProductoReventa, CartItem } from '../types/food';
import { triggerHaptic } from '../utils/haptics';

interface BiruPOSViewProps {
  isOpen: boolean;
  platos: ProductoElaborado[];
  reventa: ProductoReventa[];
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onQuickAdd: (plato: ProductoElaborado) => void;
  onQuickAddReventa: (r: ProductoReventa) => void;
  onSelectPlatoParaPersonalizar: (plato: ProductoElaborado) => void;
  onOpenCheckout: () => void;
}

export const BiruPOSView: React.FC<BiruPOSViewProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);
  const totalItems = cart.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Cabecera del Carrito */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-header-info">
            <h2 id="cart-drawer-title" className="cart-drawer-title">
              <ShoppingBag size={20} color="var(--accent-gold)" />
              <span>Tu Pedido</span>
            </h2>
            <span className="cart-drawer-badge">
              {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cart-drawer-close-btn"
            aria-label="Cerrar pedido"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Items */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={48} color="var(--text-muted)" />
              </div>
              <h3>Tu pedido está vacío</h3>
              <p>Elegí tus burgers, pizzas o bebidas favoritas de la carta para empezar.</p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
              >
                <Utensils size={16} />
                <span>Explorar La Carta</span>
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-image-col">
                    <img
                      src={item.imagen_url || '/hero_burger.png'}
                      alt={item.nombre}
                      className="cart-item-img"
                    />
                  </div>

                  <div className="cart-item-details-col">
                    <div className="cart-item-title-row">
                      <h4 className="cart-item-name">{item.nombre}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          onRemoveItem(item.id);
                        }}
                        className="cart-item-del-btn"
                        title="Eliminar del pedido"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.modificadores && item.modificadores.length > 0 && (
                      <p className="cart-item-mods">
                        {item.modificadores.map((m) => m.nombre).join(', ')}
                      </p>
                    )}

                    {item.notas && (
                      <p className="cart-item-notes">Nota: {item.notas}</p>
                    )}

                    <div className="cart-item-footer-row">
                      <span className="cart-item-price">
                        ${(item.precio_unitario * item.cantidad).toLocaleString()} UYU
                      </span>

                      {/* Stepper de cantidad */}
                      <div className="cart-item-stepper">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQty(item.id, -1);
                          }}
                          className="cart-stepper-btn"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="cart-stepper-value">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQty(item.id, 1);
                          }}
                          className="cart-stepper-btn"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del Carrito con Subtotal y Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">Subtotal estimado:</span>
              <span className="cart-subtotal-val">${total.toLocaleString()} UYU</span>
            </div>

            <p className="cart-footer-hint">
              🛵 El costo de delivery ($60) o retiro se confirma en el siguiente paso.
            </p>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenCheckout();
              }}
              className="btn-primary cart-checkout-cta-btn"
            >
              <span>Continuar al Pago</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
