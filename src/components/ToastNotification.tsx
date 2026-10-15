import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onOpenCart,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <aside
      className="toast-notification-banner"
      role="status"
      aria-live="polite"
      onClick={onOpenCart}
    >
      <div className="toast-img-wrap">
        {toast.image ? (
          <img src={toast.image} alt={toast.title} className="toast-img" />
        ) : (
          <div className="toast-icon-fallback">
            <ShoppingBag size={20} />
          </div>
        )}
      </div>

      <div className="toast-content">
        <h4 className="toast-title">{toast.title}</h4>
        <p className="toast-sub">{toast.subtitle || '¡Agregado con éxito a tu pedido!'}</p>
      </div>

      {toast.price !== undefined && (
        <span className="toast-price">${toast.price.toLocaleString()}</span>
      )}

      <button
        type="button"
        className="toast-action-btn"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCart();
        }}
        aria-label="Ver mi pedido"
      >
        <span>Ver</span>
        <ArrowRight size={14} />
      </button>
    </aside>
  );
};
