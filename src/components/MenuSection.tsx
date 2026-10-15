import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, Eye, Search, Utensils } from 'lucide-react';
import { ProductoElaborado, ProductoReventa, GrupoOpciones } from '../types/food';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { DishDetailModal } from './DishDetailModal';
import { triggerHaptic } from '../utils/haptics';

interface MenuSectionProps {
  platos: ProductoElaborado[];
  reventa?: ProductoReventa[];
  grupos?: GrupoOpciones[];
  loading?: boolean;
  onSelectPlatoParaPersonalizar: (plato: ProductoElaborado) => void;
  onQuickAddToCart: (plato: ProductoElaborado) => void;
  onQuickAddReventa?: (item: ProductoReventa) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'todos': '✨',
  'Burgers': '🍔',
  'Pizzas': '🍕',
  'Chivitos': '🥩',
  'Tablas': '🧀',
  'Tacos': '🌮',
  'Sandwiches': '🥪',
  'Papas': '🍟',
  'Milanesas': '🍖',
  'Panchos': '🌭',
  'Ensaladas': '🥗',
  'Postres': '🍨',
  'Cervezas': '🍺',
  'Refrescos': '🥤',
  'Aguas': '💧',
};

const DishCardItem: React.FC<{
  plato: ProductoElaborado;
  idx: number;
  onSelectPlatoParaPersonalizar: (plato: ProductoElaborado) => void;
  onQuickAddToCart: (plato: ProductoElaborado) => void;
  onOpenPreview: (plato: ProductoElaborado) => void;
}> = ({ plato, idx, onSelectPlatoParaPersonalizar, onQuickAddToCart, onOpenPreview }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  const isCustom = plato.es_personalizable;

  return (
    <div
      ref={ref}
      className={`dish-card scroll-reveal-dish ${isVisible ? 'revealed' : ''}`}
      style={{
        transitionDelay: isVisible ? `${(idx % 4) * 60}ms` : '0ms',
      }}
    >
      <div
        className="dish-image-wrapper"
        onClick={() => onOpenPreview(plato)}
        role="button"
        tabIndex={0}
        title={`Click para ver detalles de ${plato.nombre}`}
      >
        <img
          src={plato.imagen_url || '/hero_burger.png'}
          alt={plato.nombre}
          className="dish-image"
          loading="lazy"
        />
        <div className="dish-image-hover-overlay">
          <span className="dish-preview-hint-pill">
            <Eye size={14} />
            <span>Ver detalles</span>
          </span>
        </div>
      </div>

      <div className="dish-body">
        <div className="dish-title-row">
          <span className="dish-category-label">{plato.categoria}</span>
          <h3
            className="dish-title"
            onClick={() => onOpenPreview(plato)}
            style={{ cursor: 'pointer' }}
          >
            {plato.nombre}
          </h3>
        </div>

        <p className="dish-description">
          {plato.descripcion || 'Elaborado artesanalmente en la cocina de Biru con materias primas de primera calidad.'}
        </p>

        <div className="dish-footer-row">
          <span className="dish-price">
            ${Number(plato.precio_venta).toLocaleString()}
          </span>

          {isCustom ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectPlatoParaPersonalizar(plato);
              }}
              className="dish-add-btn dish-add-btn-custom"
              title="Personalizar plato"
            >
              <Sparkles size={15} />
              <span>Armar</span>
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                onQuickAddToCart(plato);
              }}
              className="dish-add-btn"
              title="Agregar directo al pedido"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ReventaCardItem: React.FC<{
  item: ProductoReventa;
  idx: number;
  onQuickAddReventa?: (item: ProductoReventa) => void;
  onOpenPreview: (item: ProductoReventa) => void;
}> = ({ item, idx, onQuickAddReventa, onOpenPreview }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  return (
    <div
      ref={ref}
      className={`dish-card scroll-reveal-dish ${isVisible ? 'revealed' : ''}`}
      style={{
        transitionDelay: isVisible ? `${(idx % 4) * 60}ms` : '0ms',
      }}
    >
      <div
        className="dish-image-wrapper"
        onClick={() => onOpenPreview(item)}
        role="button"
        tabIndex={0}
        title={`Click para ver detalles de ${item.nombre}`}
      >
        <img
          src={item.imagen_url || '/heladeras_vintage.png'}
          alt={item.nombre}
          className="dish-image"
          loading="lazy"
        />
        <div className="dish-image-hover-overlay">
          <span className="dish-preview-hint-pill">
            <Eye size={14} />
            <span>Ver detalles</span>
          </span>
        </div>
      </div>

      <div className="dish-body">
        <div className="dish-title-row">
          <span className="dish-category-label">{item.categoria || 'Bebida'}</span>
          <h3
            className="dish-title"
            onClick={() => onOpenPreview(item)}
            style={{ cursor: 'pointer' }}
          >
            {item.nombre}
          </h3>
        </div>

        <p className="dish-description">
          {item.descripcion || 'Bebida servida bien fría, ideal para acompañar tu comida en Biru.'}
        </p>

        <div className="dish-footer-row">
          <span className="dish-price">
            ${Number(item.precio_venta).toLocaleString()}
          </span>

          <button
            onClick={() => {
              triggerHaptic('light');
              if (onQuickAddReventa) onQuickAddReventa(item);
            }}
            className="dish-add-btn"
            title="Agregar bebida al pedido"
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MenuSection: React.FC<MenuSectionProps> = ({
  platos,
  reventa = [],
  grupos = [],
  loading = false,
  onSelectPlatoParaPersonalizar,
  onQuickAddToCart,
  onQuickAddReventa,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<{ tipo: 'elaborado'; data: ProductoElaborado } | { tipo: 'reventa'; data: ProductoReventa } | null>(null);

  // Categorías combinadas y ordenadas de forma atractiva
  const categories = useMemo(() => {
    const set = new Set<string>();
    platos.forEach(p => {
      if (p.categoria) set.add(p.categoria);
    });
    reventa.forEach(r => {
      if (r.categoria) set.add(r.categoria);
    });

    const priorityOrder = ['Burgers', 'Pizzas', 'Chivitos', 'Tablas', 'Tacos', 'Sandwiches', 'Papas', 'Milanesas', 'Panchos', 'Ensaladas', 'Postres', 'Cervezas', 'Refrescos', 'Aguas'];
    const sorted = Array.from(set).sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return ['todos', ...sorted];
  }, [platos, reventa]);

  // Filtrado de platos y reventa
  const filteredElaborados = useMemo(() => {
    return platos.filter(p => {
      if (!p.activo) return false;
      const matchCat = selectedCategory === 'todos' || p.categoria === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.insumos_receta && p.insumos_receta.some(i => i.nombre.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchQuery;
    });
  }, [platos, selectedCategory, searchQuery]);

  const filteredReventa = useMemo(() => {
    return reventa.filter(r => {
      if (!r.activo) return false;
      const matchCat = selectedCategory === 'todos' || r.categoria === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.descripcion && r.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [reventa, selectedCategory, searchQuery]);

  const totalFilteredCount = filteredElaborados.length + filteredReventa.length;

  return (
    <section id="menu" className="menu-section">
      <div className="page-container">
        {/* Cabecera de la carta */}
        <div className="menu-header">
          <div className="menu-title-group">
            <span className="badge-tag red">
              <Utensils size={14} /> LA CARTA BIRU
            </span>
            <h2 className="menu-main-title">Elegí lo que más te tienta</h2>
            <p className="menu-subtitle">
              Burgers artesanales, pizzas de masa madre, tablas para picar, chivitos y cerveza helada.
            </p>
          </div>

          {/* Buscador interactivo */}
          <div className="menu-search-wrapper">
            <Search size={18} className="menu-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o ingrediente (ej: cheddar, asado, masa madre...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="menu-search-clear"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Barra de Categorías / Filtros */}
        <div className="menu-categories-scroll">
          {categories.map(cat => {
            const emoji = CATEGORY_EMOJIS[cat] || '🍽️';
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat);
                }}
                className={`menu-cat-pill ${isActive ? 'active' : ''}`}
              >
                <span className="cat-pill-emoji">{emoji}</span>
                <span className="cat-pill-text">{cat === 'todos' ? 'Todos' : cat}</span>
              </button>
            );
          })}
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="menu-loading-state">
            <div className="loading-spinner-biru" />
            <p>Cargando la carta fresca de Biru...</p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && totalFilteredCount === 0 && (
          <div className="menu-empty-state">
            <div className="menu-empty-icon">🔍</div>
            <h3>No encontramos platos para esa búsqueda</h3>
            <p>Probá con otra palabra o seleccioná otra categoría.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              Ver toda la carta
            </button>
          </div>
        )}

        {/* Grid de Platos Elaborados */}
        {!loading && filteredElaborados.length > 0 && (
          <div className="dishes-grid">
            {filteredElaborados.map((plato, idx) => (
              <DishCardItem
                key={plato.producto_elaborado_id}
                plato={plato}
                idx={idx}
                onSelectPlatoParaPersonalizar={onSelectPlatoParaPersonalizar}
                onQuickAddToCart={onQuickAddToCart}
                onOpenPreview={(p) => setPreviewItem({ tipo: 'elaborado', data: p })}
              />
            ))}
          </div>
        )}

        {/* Grid de Reventa (Bebidas / Cervezas) */}
        {!loading && filteredReventa.length > 0 && (
          <div className="reventa-section-block">
            {selectedCategory === 'todos' && (
              <div className="section-divider-title">
                <h3>🍺 Cervezas, Refrescos & Bebidas</h3>
                <p>Las mejores cervezas tiradas, artesanales y bebidas frías</p>
              </div>
            )}
            <div className="dishes-grid">
              {filteredReventa.map((item, idx) => (
                <ReventaCardItem
                  key={item.producto_reventa_id}
                  item={item}
                  idx={idx}
                  onQuickAddReventa={onQuickAddReventa}
                  onOpenPreview={(r) => setPreviewItem({ tipo: 'reventa', data: r })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle al hacer click */}
      {previewItem && (
        <DishDetailModal
          item={previewItem}
          grupos={grupos}
          onClose={() => setPreviewItem(null)}
          onCustomize={onSelectPlatoParaPersonalizar}
          onQuickAdd={onQuickAddToCart}
          onQuickAddReventa={onQuickAddReventa}
        />
      )}
    </section>
  );
};
