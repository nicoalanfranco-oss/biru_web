import React, { useState, useEffect } from 'react';
import { Utensils, Sparkles, Bike, MapPin, Beer, ArrowRight } from 'lucide-react';
import { MarcaInfo, TenantInfo } from '../types/food';
import { HeroVideoShowcase } from './HeroVideoShowcase';

interface HeroSectionProps {
  marca?: MarcaInfo;
  tenant?: TenantInfo;
  onExploreMenu?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  return (
    <section id="inicio" className="hero-section hero-biru-theme">
      {/* Luces y brillo ambiental */}
      <div className="hero-bg-decoration" aria-hidden="true">
        <div className="hero-blob hero-blob-crimson" />
        <div className="hero-blob hero-blob-amber" />
      </div>

      <div className="page-container">
        <div className="hero-content-grid">
          {/* Lado Texto / Pitch */}
          <div className={`hero-text-col ${isLoaded ? 'hero-text-animate' : ''}`}>
            <div className="hero-badge-pill">
              <span className="hero-badge-dot" />
              <span>EST. 2013 • TACUAREMBÓ • CATALINA 98</span>
            </div>

            <h1 className="hero-main-title">
              Burgers Doble Carne, <br />
              <span className="hero-highlight-text">Pizzas de Masa Madre</span> <br />
              & Buena Música.
            </h1>

            <p className="hero-subtext">
              Comida de altísima calidad elaborada a mano con ingredientes seleccionados. Disfrutá la auténtica mística de bar retro en nuestro salón o pedí online directo a cocina.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                onClick={onExploreMenu}
                className="btn-primary hero-btn-order"
              >
                <Utensils size={18} />
                <span>Ver La Carta y Pedir</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#cultura"
                className="btn-secondary hero-btn-story"
              >
                <Beer size={18} />
                <span>El Bar & Fotos</span>
              </a>
            </div>

            {/* Badges de confianza y servicio */}
            <div className="hero-features-row">
              <div className="hero-feat-item">
                <Bike size={16} className="hero-feat-icon" />
                <span>Delivery todos los días</span>
              </div>
              <div className="hero-feat-item">
                <Sparkles size={16} className="hero-feat-icon" />
                <span>Masa madre 100% natural</span>
              </div>
              <div className="hero-feat-item">
                <MapPin size={16} className="hero-feat-icon" />
                <span>Salón Miér a Dom</span>
              </div>
            </div>
          </div>

          {/* Lado Video Spot Cinematográfico Ligero */}
          <div className={`hero-visual-col ${isLoaded ? 'hero-visual-animate' : ''}`}>
            <HeroVideoShowcase onExploreMenu={onExploreMenu} />
          </div>
        </div>
      </div>
    </section>
  );
};
