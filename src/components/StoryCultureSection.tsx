import React, { useState, useEffect } from 'react';
import { Flame, Beer, Heart, Sparkles, MapPin, Music } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { BiruEmblem3D } from './BiruEmblem3D';

export const StoryCultureSection: React.FC = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const photos = [
    {
      url: '/hero_exterior_noche.jpg',
      caption: 'Nuestra esquina en Catalina 98: luces cálidas, deck de madera y noche de bar',
    },
    {
      url: '/pizza_masa_madre.jpg',
      caption: 'Pizzas artesanales elaboradas 100% con masa madre de fermentación natural',
    },
    {
      url: '/interior_ladrillo.jpg',
      caption: 'Mística rock & roll: cuadros de vinilos, ladrillo visto y buena energía',
    },
    {
      url: '/interior_salon.jpg',
      caption: 'El salón interior para compartir las mejores charlas y platos con amigos',
    },
    {
      url: '/heladeras_vintage.jpg',
      caption: 'Colección de botellas y heladeras vintage: lo que importa es lo de adentro',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 400);
    }, 4500);
    return () => clearInterval(timer);
  }, [photos.length]);

  const valores = [
    {
      icon: <Flame size={24} color="#D97706" />,
      title: 'Masa Madre & Fuego',
      desc: 'Fermentación lenta y natural para masas crujientes, livianas y de digestión perfecta.',
    },
    {
      icon: <Beer size={24} color="var(--primary)" />,
      title: 'Burgers Doble Carne',
      desc: 'Cortes seleccionados, pan brioche artesanal, panceta crocante y aderezos de autor.',
    },
    {
      icon: <Music size={24} color="#F59E0B" />,
      title: 'Mística Retro Bar',
      desc: 'Un espacio con alma propia: vinilos, rock & roll, maderas rústicas y buena vibra.',
    },
    {
      icon: <Heart size={24} color="var(--primary)" />,
      title: 'Calidad Sin Concesiones',
      desc: 'Cada plato se elabora al momento con ingredientes frescos de la más alta excelencia.',
    },
  ];

  return (
    <section id="cultura" className="story-section story-biru-theme" ref={sectionRef}>
      <div className="page-container">
        <div className={`story-layout scroll-reveal ${isVisible ? 'revealed' : ''}`}>
          
          {/* Encabezado */}
          <div className="story-header-block">
            <span className="badge-tag red">
              <Beer size={14} /> MÍSTICA BIRU
            </span>

            <h2 className="story-heading">
              Pasión por el Buen Comer, <br />
              <span style={{ color: 'var(--accent-gold)' }}>Espíritu de Bar Retro.</span>
            </h2>

            <p className="story-description">
              Desde 2013 en Tacuarembó, Biru es el punto de encuentro donde se unen la cocina artesanal sin atajos, la cerveza fría y los buenos momentos. De la barra a tu mesa, o directo a tu casa con nuestro delivery.
            </p>
          </div>

          {/* Logo con sheen — mismo efecto que el logo del menú */}
          <div className="story-watermark-block">
            <BiruEmblem3D size="lg" animated={true} />
          </div>

          {/* Grid de Valores */}
          <div className="story-values-grid">
            {valores.map((val, idx) => (
              <div
                key={idx}
                className={`story-value-card scroll-reveal ${isVisible ? 'revealed' : ''}`}
                style={{ transitionDelay: isVisible ? `${150 + idx * 80}ms` : '0ms' }}
              >
                <div className="story-value-icon">{val.icon}</div>
                <h4>{val.title}</h4>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>

          {/* Foto rotativa del local / platos */}
          <div className="story-photo-frame">
            <img
              src={photos[currentIndex].url}
              alt="Cultura Biru"
              className={`story-photo-img ${isTransitioning ? 'fading' : ''}`}
            />
            <div className="story-photo-caption">
              <Sparkles size={16} color="var(--accent-gold)" />
              <span>{photos[currentIndex].caption}</span>
            </div>

            {/* Dots */}
            <div className="story-photo-dots">
              {photos.map((_, i) => (
                <button
                  key={i}
                  className={`story-dot ${currentIndex === i ? 'active' : ''}`}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentIndex(i);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
