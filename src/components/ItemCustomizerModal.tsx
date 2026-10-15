import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { ProductoElaborado, GrupoOpciones, OpcionPersonalizacion, CartItem, CartItemModifier } from '../types/food';
import { triggerHaptic } from '../utils/haptics';

interface ItemCustomizerModalProps {
  plato: ProductoElaborado | null;
  grupos: GrupoOpciones[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  plato,
  grupos,
  onClose,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, OpcionPersonalizacion[]>>({});
  const [notas, setNotas] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar grupos correspondientes al plato
  const dishGroups = grupos.filter(
    g => g.producto_elaborado_id === plato?.producto_elaborado_id || (!g.producto_elaborado_id && g.activo)
  );

  useEffect(() => {
    setSelectedOptions({});
    setNotas('');
    setCantidad(1);
    setErrorMsg('');
  }, [plato]);

  if (!plato) return null;

  const toggleOption = (grupo: GrupoOpciones, opcion: OpcionPersonalizacion) => {
    triggerHaptic('light');
    setSelectedOptions(prev => {
      const current = prev[grupo.grupo_id] || [];
      const exists = current.some(o => o.opcion_id === opcion.opcion_id);

      if (exists) {
        return {
          ...prev,
          [grupo.grupo_id]: current.filter(o => o.opcion_id !== opcion.opcion_id),
        };
      }

      if (grupo.max_opciones === 1) {
        return {
          ...prev,
          [grupo.grupo_id]: [opcion],
        };
      }

      if (current.length >= grupo.max_opciones) {
        return prev;
      }

      return {
        ...prev,
        [grupo.grupo_id]: [...current, opcion],
      };
    });
  };

  const extraTotal = Object.values(selectedOptions)
    .flat()
    .reduce((acc, opt) => acc + Number(opt.precio_extra || 0), 0);

  const unitPrice = Number(plato.precio_venta) + extraTotal;
  const totalPrice = unitPrice * cantidad;

  const handleConfirm = () => {
    for (const g of dishGroups) {
      const count = (selectedOptions[g.grupo_id] || []).length;
      if (count < g.min_opciones) {
        setErrorMsg(`Debes seleccionar al menos ${g.min_opciones} opción en "${g.nombre}"`);
        return;
      }
    }

    const flatModifiers: CartItemModifier[] = Object.entries(selectedOptions).flatMap(
      ([grupoId, opts]) => {
        const gName = dishGroups.find(g => g.grupo_id === Number(grupoId))?.nombre;
        return opts.map(o => ({
          opcion_id: o.opcion_id,
          nombre: o.nombre,
          precio_extra: Number(o.precio_extra || 0),
          grupo_nombre: gName,
        }));
      }
    );

    const cartItem: CartItem = {
      id: `${plato.producto_elaborado_id}_${Date.now()}`,
      producto_id: plato.producto_elaborado_id,
      tipo: 'elaborado',
      nombre: plato.nombre,
      categoria: plato.categoria,
      precio_base: Number(plato.precio_venta),
      precio_unitario: unitPrice,
      cantidad,
      imagen_url: plato.imagen_url || '/hero_burger.png',
      modificadores: flatModifiers,
      notas: notas.trim() || undefined,
    };

    triggerHaptic('medium');
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container customizer-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="customizer-header">
          <div className="customizer-header-info">
            <span className="badge-tag red">Personalización</span>
            <h2>{plato.nombre}</h2>
            <p className="customizer-base-price">
              Precio base: ${Number(plato.precio_venta).toLocaleString()} UYU
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="customizer-body">
          {errorMsg && (
            <div className="customizer-error-alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {dishGroups.length === 0 ? (
            <div className="customizer-no-groups">
              <p>Este plato se prepara con su receta artesanal original completa.</p>
              {plato.descripcion && <p className="customizer-desc">{plato.descripcion}</p>}
            </div>
          ) : (
            dishGroups.map(grupo => {
              const current = selectedOptions[grupo.grupo_id] || [];
              const isRequired = grupo.min_opciones > 0;

              return (
                <div key={grupo.grupo_id} className="customizer-group-block">
                  <div className="customizer-group-header">
                    <div>
                      <h4 className="customizer-group-title">{grupo.nombre}</h4>
                      <p className="customizer-group-rules">
                        {isRequired ? `Obligatorio (min ${grupo.min_opciones})` : 'Opcional'} • Máximo {grupo.max_opciones}
                      </p>
                    </div>
                    <span className="customizer-group-count">
                      {current.length}/{grupo.max_opciones}
                    </span>
                  </div>

                  <div className="customizer-options-grid">
                    {grupo.opciones.map(opcion => {
                      const isSelected = current.some(o => o.opcion_id === opcion.opcion_id);
                      return (
                        <button
                          key={opcion.opcion_id}
                          type="button"
                          onClick={() => toggleOption(grupo, opcion)}
                          className={`customizer-opt-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="customizer-opt-left">
                            <div className="customizer-checkbox">
                              {isSelected && <Check size={14} />}
                            </div>
                            <span className="customizer-opt-name">{opcion.nombre}</span>
                          </div>
                          {Number(opcion.precio_extra) > 0 && (
                            <span className="customizer-opt-extra">
                              +${Number(opcion.precio_extra).toLocaleString()} UYU
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Notas */}
          <div className="customizer-notes-block">
            <label>Instrucciones o preferencias para este plato</label>
            <input
              type="text"
              placeholder="Ej: bien crocante, aderezo aparte, etc."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="checkout-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="customizer-footer">
          <div className="customizer-stepper-wrap">
            <button
              type="button"
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              className="cart-stepper-btn"
            >
              <Minus size={14} />
            </button>
            <span className="cart-stepper-value">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad(c => c + 1)}
              className="cart-stepper-btn"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary customizer-submit-btn"
          >
            <ShoppingBag size={18} />
            <span>Agregar • ${totalPrice.toLocaleString()} UYU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
