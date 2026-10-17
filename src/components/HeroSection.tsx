import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Utensils, Sparkles, Bike, MapPin, Beer, ArrowRight } from 'lucide-react';
import { MarcaInfo, TenantInfo } from '../types/food';
import { HeroVideoShowcase } from './HeroVideoShowcase';

interface HeroSectionProps {
  marca?: MarcaInfo;
  tenant?: TenantInfo;
  onExploreMenu?: () => void;
}

// ============================================================================
// CONFIGURACIÓN DE MODO HERO:
// 'cinematic-reveal' -> Prueba de animación: inicia abarcando hero total y se achica desplazándose a la derecha al entrar el texto de izq a der.
// 'standard'         -> Configuración anterior intacta (dos columnas directas fijas).
// ============================================================================
const HERO_MODE: string = 'cinematic-reveal'; // 'cinematic-reveal' | 'standard'
const SINGLE_CYCLE_FALLBACK_MS = 4800; // Máximo 1 sola repetición exacta (4.5s del video limpio + margen)


export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 991;
  const [isLoaded, setIsLoaded] = useState(isMobile);
  // Estado cinemático: en móvil entra todo directo ('docked'). En escritorio arranca 'expanded' y se acomoda tras el video.
  const [cinematicState, setCinematicState] = useState<'expanded' | 'docked'>(
    isMobile ? 'docked' : 'expanded'
  );
  const hasDockedRef = useRef(isMobile);

  const handleCycleFinished = useCallback(() => {
    if (!hasDockedRef.current) {
      hasDockedRef.current = true;
      setCinematicState('docked');
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (HERO_MODE === 'standard' || window.innerWidth <= 991) {
      setIsLoaded(true);
      setCinematicState('docked');
      return;
    }

    // Fallback de seguridad para 1 sola reproducción en escritorio si no dispara el evento del video
    const timer = setTimeout(() => {
      handleCycleFinished();
    }, SINGLE_CYCLE_FALLBACK_MS);

    return () => clearTimeout(timer);
  }, [handleCycleFinished]);

  const isCinematic = HERO_MODE === 'cinematic-reveal';
  const isDocked = cinematicState === 'docked';

  return (
    <section id="inicio" className="hero-section hero-biru-theme">
      {/* Luces y brillo ambiental */}
      <div className="hero-bg-decoration" aria-hidden="true">
        <div className="hero-blob hero-blob-crimson" />
        <div className="hero-blob hero-blob-amber" />
      </div>

      <div className="page-container">
        <div className={`hero-content-grid ${isCinematic ? 'cinematic-intro-grid' : ''}`}>
          {/* Lado Texto / Pitch */}
          <div
            className={`hero-text-col ${
              isCinematic
                ? isDocked
                  ? 'cinematic-text-entered'
                  : 'cinematic-text-initial'
                : isLoaded
                ? 'hero-text-animate'
                : ''
            }`}
          >
            <div className="hero-badge-pill">
              <span className="hero-badge-dot" />
              <span>DESDE 2013 • TACUAREMBÓ • CATALINA 98</span>
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
          <div
            className={`hero-visual-col ${
              isCinematic
                ? isDocked
                  ? 'cinematic-video-docked'
                  : 'cinematic-video-initial'
                : isLoaded
                ? 'hero-visual-animate'
                : ''
            }`}
          >
            <HeroVideoShowcase
              onExploreMenu={onExploreMenu}
              onFirstCycleComplete={handleCycleFinished}
            />
          </div>
        </div>
      </div>
    </section>
  );
};



