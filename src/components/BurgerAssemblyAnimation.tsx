import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, MessageCircle, Phone, MapPin } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerAssemblyHeroProps {
  onExploreMenu?: () => void;
}

export const BurgerAssemblyAnimation: React.FC<BurgerAssemblyHeroProps> = ({ onExploreMenu }) => {
  // Estados de la animación cinemática comercial (/tvads):
  // 1: 'exploded' -> Vista de despiece 3D de los ingredientes flotando en el espacio
  // 2: 'assembling' -> Ensamblado suave capa por capa de abajo hacia arriba
  // 3: 'settling' -> Transición fluida asentando en la composición
  // 4: 'frozen' -> Congelado final en la estética oscura de referencia con logo y textos 3D
  const [animState, setAnimState] = useState<'exploded' | 'assembling' | 'settling' | 'frozen'>('exploded');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reproducir efectos de sonido cinemáticos opcionales
  const playSound = (type: 'whoosh' | 'thud' | 'climax') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'whoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'climax') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.81);
      }
    } catch {}
  };

  // Secuencia temporal de la animación
  useEffect(() => {
    // 1. Mostrar despiece inicial por 1.2 segundos
    timerRef.current = setTimeout(() => {
      setAnimState('assembling');
      playSound('whoosh');
      triggerHaptic();

      // 2. Transición hacia el asentado (1.8s después)
      timerRef.current = setTimeout(() => {
        setAnimState('settling');
        triggerHaptic();

        // 3. Congelado final y revelación de textos/logo 3D (0.7s después)
        timerRef.current = setTimeout(() => {
          setAnimState('frozen');
          playSound('climax');
          triggerHaptic();
        }, 650);
      }, 1800);
    }, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const replayAnimation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimState('exploded');
    triggerHaptic();

    timerRef.current = setTimeout(() => {
      setAnimState('assembling');
      playSound('whoosh');
      triggerHaptic();

      timerRef.current = setTimeout(() => {
        setAnimState('settling');
        triggerHaptic();

        timerRef.current = setTimeout(() => {
          setAnimState('frozen');
          playSound('climax');
          triggerHaptic();
        }, 650);
      }, 1800);
    }, 1200);
  };

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSoundEnabled(!soundEnabled);
    triggerHaptic();
  };

  return (
    <div className="biru-cinematic-tvad-wrapper" onClick={() => animState === 'frozen' && replayAnimation()}>
      {/* Contenedor con encuadre y proporción exacta de la foto de referencia */}
      <div className={`tvad-cinematic-canvas state-${animState}`}>
        
        {/* FONDO OSCURO DEL PUB CON ILUMINACIÓN DE ESTUDIO */}
        <div className="tvad-canvas-layer tvad-bg-layer">
          <img 
            src="/layer_3d_bg.jpg" 
            alt="Ambiente oscuro de pub Biru" 
            className="tvad-full-img" 
          />
        </div>

        {/* ==========================================================================
            VISTA DE DESPIECE & ENSAMBLADO CAPA POR CAPA (DE ABAJO HACIA ARRIBA)
            ========================================================================== */}
        <div className={`tvad-assembly-stage ${animState === 'settling' || animState === 'frozen' ? 'stage-settled' : ''}`}>
          
          {/* Capa 0: Plato vintage de metal con papas rústicas */}
          <div className="tvad-layer-slice slice-plate">
            <img src="/layer_3d_plate.png" alt="Plato con papas fritas" className="tvad-full-img" />
          </div>

          {/* Capa 1: Pan inferior brioche tostado */}
          <div className="tvad-layer-slice slice-bun-bottom">
            <img src="/layer_3d_bun_bottom.png" alt="Base de pan brioche" className="tvad-full-img" />
          </div>

          {/* Capa 2: Lechuga fresca ondulada */}
          <div className="tvad-layer-slice slice-lettuce">
            <img src="/layer_3d_lettuce.png" alt="Lechuga fresca" className="tvad-full-img" />
          </div>

          {/* Capa 3: Medallón de carne con cheddar fundido */}
          <div className="tvad-layer-slice slice-patty">
            <img src="/layer_3d_patty.png" alt="Carne con queso fundido" className="tvad-full-img" />
          </div>

          {/* Capa 4: Panceta ahumada crocante */}
          <div className="tvad-layer-slice slice-bacon">
            <img src="/layer_3d_bacon.png" alt="Panceta crocante" className="tvad-full-img" />
          </div>

          {/* Capa 5: Huevo frito con yema líquida dorada */}
          <div className="tvad-layer-slice slice-egg">
            <img src="/layer_3d_egg.png" alt="Huevo frito con yema líquida" className="tvad-full-img" />
          </div>

          {/* Capa 6: Corona de pan brioche con sésamo */}
          <div className="tvad-layer-slice slice-bun-top">
            <img src="/layer_3d_bun_top.png" alt="Corona brioche con sésamo" className="tvad-full-img" />
          </div>
        </div>

        {/* ==========================================================================
            CONGELADO FINAL: EXACTA COMPOSICIÓN, ENCUADRE Y ESTÉTICA OSCURA DE LA FOTO
            ========================================================================== */}
        <div className={`tvad-frozen-final-scene ${animState === 'frozen' ? 'is-frozen-visible' : 'is-frozen-hidden'}`}>
          <img 
            src="/hero_burger.png" 
            alt="Foto original de referencia Biru Bar & Delivery" 
            className="tvad-full-img" 
          />

          {/* LOGO BIRU REDISEÑADO CON VOLUMEN 3D PROFESIONAL E ILUMINACIÓN DE ALTA GAMA */}
          <div className="biru-3d-redesigned-logo">
            <div className="logo-3d-bevel-frame">
              <div className="logo-3d-gold-rim">
                <div className="logo-3d-inner-chamber">
                  <span className="logo-3d-est">★ 20 • TBÓ • 13 ★</span>
                  <span className="logo-3d-script-wordmark">Biru</span>
                  <span className="logo-3d-sub-bar">BAR &amp; DELIVERY</span>
                  <div className="logo-3d-sheen-shine" />
                </div>
              </div>
            </div>
          </div>

          {/* TEXTOS INFORMATIVOS EN 3D PROFESIONAL CON RELIEVE Y VOLUMEN */}
          <div className="biru-3d-redesigned-typography">
            <h2 className="typo-3d-horarios">HORARIOS</h2>
            
            <div className="typo-3d-block typo-salon">
              <span className="label-dim">SALÓN</span>
              <strong className="val-bold">MIÉRCOLES A DOMINGOS</strong>
            </div>

            <div className="typo-3d-block typo-delivery">
              <span className="val-delivery">DELIVERY <u>TODOS LOS DÍAS</u></span>
            </div>

            <div className="typo-3d-block typo-horario">
              <span className="val-hours">A PARTIR DE 20 HS</span>
            </div>
          </div>

          {/* BARRA INFERIOR DE CONTACTO CALCADA Y MEJORADA EN 3D */}
          <div className="biru-3d-bottom-contact-bar">
            <a 
              href="https://wa.me/59892033390" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-chip-3d wpp"
              title="WhatsApp: 092 033 390"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={18} className="chip-ico" />
              <span>092 033 390</span>
            </a>

            <a 
              href="tel:46325415" 
              className="contact-chip-3d phone"
              title="Teléfono: 4632 5415"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={18} className="chip-ico" />
              <span>4632 5415</span>
            </a>

            <a 
              href="https://maps.google.com/?q=Catalina+98+Tacuarembo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-chip-3d map"
              title="Ubicación: Catalina 98, Tacuarembó"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={18} className="chip-ico" />
              <span>CATALINA 98</span>
            </a>
          </div>

          {/* Destello de barrido de luz de estudio de alta gama al congelar */}
          <div className="frozen-studio-light-sweep" />
        </div>

        {/* CONTROLES DISCRETOS MINIMALISTAS EN LA ESQUINA SUPERIOR */}
        <div className="tvad-corner-controls">
          <button 
            type="button" 
            onClick={replayAnimation}
            className="corner-btn-glass"
            title="Repetir animación de despiece y armado 3D"
          >
            <RotateCcw size={12} />
            <span>{animState === 'frozen' ? 'Repetir Armado 3D' : 'Reiniciar'}</span>
          </button>

          <button 
            type="button" 
            onClick={toggleSound}
            className={`corner-btn-glass ${soundEnabled ? 'active' : ''}`}
            title={soundEnabled ? 'Silenciar Efectos' : 'Activar Sonido'}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};
