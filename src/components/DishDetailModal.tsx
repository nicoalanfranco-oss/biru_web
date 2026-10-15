import React, { useEffect } from 'react';
import { X, Plus, Sparkles, Check, ShoppingBag, Utensils } from 'lucide-react';
import { ProductoElaborado, ProductoReventa, GrupoOpciones } from '../types/food';
import { triggerHaptic } from '../utils/haptics';

interface DishDetailModalProps {
  item: { tipo: 'elaborado'; data: ProductoElaborado } | { tipo: 'reventa'; data: ProductoReventa } | null;
  grupos?: GrupoOpciones[];
  onClose: () => void;
  onCustomize?: (plato: ProductoElaborado) => void;
  onQuickAdd: (plato: ProductoElaborado) => void;
  onQuickAddReventa?: (item: ProductoReventa) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  item,
  onClose,
  onCustomize,
  onQuickAdd,
  onQuickAddReventa,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('modal-open');
    };
  }, []);

  if (!item) return null;

  const isElaborado = item.tipo === 'elaborado';
  const plato = isElaborado ? (item.data as ProductoElaborado) : null;
  const reventa = !isElaborado ? (item.data as ProductoReventa) : null;

  const nombre = plato ? plato.nombre : reventa?.nombre || '';
  const descripcion = plato ? plato.descripcion : reventa?.descripcion;
  const precio = plato ? plato.precio_venta : reventa?.precio_venta || 0;
  const imagenUrl = (plato ? plato.imagen_url : reventa?.imagen_url) || '/hero_burger.png';
  const isCustomizable = plato?.es_personalizable ?? false;

  const handleAdd = () => {
    triggerHaptic('medium');
    if (isElaborado && plato) {
      if (isCustomizable && onCustomize) {
        onCustomize(plato);
      } else {
        onQuickAdd(plato);
      }
    } else if (reventa && onQuickAddReventa) {
      onQuickAddReventa(reventa);
    }
    onClose();
  };

  return (
    <div className="dish-modal-backdrop" onClick={onClose}>
      <div
        className="dish-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-modal-title"
      >
        <button
          className="dish-modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar vista de plato"
        >
          <X size={20} />
        </button>

        <div className="dish-modal-content-grid">
          {/* Lado Imagen */}
          <div className="dish-modal-media-col">
            <img
              src={imagenUrl}
              alt={nombre}
              className="dish-modal-image"
            />
            <div className="dish-modal-image-gradient" />
          </div>

          {/* Lado Detalles */}
          <div className="dish-modal-info-col">
            <div className="dish-modal-header">
              <span className="dish-modal-cat-tag">
                {isElaborado ? (plato?.categoria || 'Especialidad Biru') : (reventa?.categoria || 'Bebida')}
              </span>
              <h2 id="dish-modal-title" className="dish-modal-title">
                {nombre}
              </h2>
            </div>

            <div className="dish-modal-price-row">
              <span className="dish-modal-price">${Number(precio).toLocaleString()} UYU</span>
            </div>

            {descripcion && (
              <div className="dish-modal-desc-box">
                <p className="dish-modal-description">{descripcion}</p>
              </div>
            )}

            {/* Insumos / Ingredientes de la Receta si existen */}
            {plato?.insumos_receta && plato.insumos_receta.length > 0 && (
              <div className="dish-modal-ingredients-section">
                <h4 className="dish-modal-section-title">
                  <Utensils size={14} />
                  <span>Ingredientes & Preparación</span>
                </h4>
                <div className="dish-modal-ingredients-tags">
                  {plato.insumos_receta.map((ins, i) => (
                    <span key={i} className="dish-ingredient-chip">
                      {ins.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="dish-modal-footer">
              <button
                type="button"
                onClick={handleAdd}
                className="btn-primary dish-modal-cta-btn"
              >
                {isCustomizable ? (
                  <>
                    <Sparkles size={18} />
                    <span>Personalizar y Agregar • ${Number(precio).toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Agregar al Pedido • ${Number(precio).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
