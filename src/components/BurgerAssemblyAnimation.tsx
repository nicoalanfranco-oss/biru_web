import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Flame, Clock, MapPin, Phone, MessageCircle, ArrowRight, Utensils } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerTVAdHeroProps {
  onExploreMenu?: () => void;
}

interface ShotInfo {
  id: number;
  time: number;
  label: string;
  tagline: string;
  subtext: string;
  cameraTransform: string;
}

const TV_SHOTS: ShotInfo[] = [
  {
    id: 0,
    time: 2200,
    label: '01 // BASE & PAPAS RÚSTICAS',
    tagline: 'Papas Rústicas Crocantes',
    subtext: 'Servidas en fuente vintage de chapa con papel encerado artesanal',
    cameraTransform: 'scale(1.95) translate(-14%, 22%)',
  },
  {
    id: 1,
    time: 2200,
    label: '02 // MEDALLÓN & CHEDDAR',
    tagline: '100% Carne Premium & Queso Fundido',
    subtext: 'Doble carne vacuna sellada al hierro con costra crocante y cheddar fundido',
    cameraTransform: 'scale(2.35) translate(-6%, 6%)',
  },
  {
    id: 2,
    time: 2200,
    label: '03 // HUEVO FRITO DE CAMPO',
    tagline: 'Huevo de Campo & Yema Líquida',
    subtext: 'Puntilla crocante de bar y yema dorada cremosa que baña cada bocado',
    cameraTransform: 'scale(2.55) translate(14%, 2%)',
  },
  {
    id: 3,
    time: 2200,
    label: '04 // CORONA BRIOCHE & SÉSAMO',
    tagline: 'Pan Brioche Tostado al Fuego',
    subtext: 'Corona esponjosa horneada con manteca, semillas de sésamo y palillo insignia',
    cameraTransform: 'scale(2.1) translate(4%, -14%)',
  },
  {
    id: 4,
    time: 0, // Clímax final sostenido
    label: '05 // LA EXPERIENCIA BIRU',
    tagline: 'La Burger Más Pedida de Tacuarembó',
    subtext: 'Doble Carne • Huevo de Campo • Panceta • Cheddar • Papas Rústicas',
    cameraTransform: 'scale(1) translate(0%, 0%)',
  },
];

export const BurgerAssemblyAnimation: React.FC<BurgerTVAdHeroProps> = ({ onExploreMenu }) => {
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar Web Audio para SFX cinemáticos de TV Ad
  const playCinematicSound = (type: 'swoosh' | 'climax' | 'tick') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'swoosh') {
        // Sonido de barrido de cámara TV
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'climax') {
        // Impacto cinematográfico bajo (Sub Bass Boom) + Brillo
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(110, now);
        subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.8);
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 1.2);

        // Chime brillante
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(880, now + 0.1);
        chime.frequency.setValueAtTime(1320, now + 0.3);
        chimeGain.gain.setValueAtTime(0.08, now + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now + 0.1);
        chime.stop(now + 1.0);
      }
    } catch {
      // Ignorar errores de audio en navegadores restrictivos
    }
  };

  // Temporizador de tomas del Spot de TV
  useEffect(() => {
    if (!isPlaying) return;

    const currentShot = TV_SHOTS[currentShotIndex];
    if (currentShot.time > 0) {
      playCinematicSound('swoosh');
      timerRef.current = setTimeout(() => {
        setCurrentShotIndex((prev) => {
          const next = prev + 1;
          if (next === TV_SHOTS.length - 1) {
            playCinematicSound('climax');
          }
          return next;
        });
        triggerHaptic();
      }, currentShot.time);
    } else {
      // Clímax final alcanzado
      playCinematicSound('climax');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentShotIndex, isPlaying, soundEnabled]);

  const restartSpot = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentShotIndex(0);
    setIsPlaying(true);
    triggerHaptic();
  };

  const jumpToShot = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentShotIndex(index);
    if (index === TV_SHOTS.length - 1) {
      playCinematicSound('climax');
    } else {
      playCinematicSound('swoosh');
    }
    triggerHaptic();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    triggerHaptic();
  };

  // Parallax interactivo sutil
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setMouseOffset({ x, y });
  };

  const currentShot = TV_SHOTS[currentShotIndex];
  const isFinalScene = currentShotIndex === TV_SHOTS.length - 1;

  return (
    <div className="tvad-hero-container">
      {/* Marco de Pantalla / Spot de TV */}
      <div 
        ref={containerRef}
        className={`tvad-screen-frame ${isFinalScene ? 'is-climax-reveal' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Lente Anamórfico & Resplandor Cinemático de TV */}
        <div className="tvad-lens-flare" />
        <div className="tvad-vignette-cinematic" />

        {/* OVERLAY DE GRABACIÓN CINEMÁTICA / TV AD BROADCAST */}
        <div className="tvad-broadcast-hud">
          <div className="hud-rec-indicator">
            <span className="rec-blinking-dot" />
            <span className="rec-text">BIRU TV AD SPOT • 4K HDR</span>
          </div>

          <div className="hud-shot-badge">
            <span>{currentShot.label}</span>
          </div>
        </div>

        {/* CONTENEDOR DE LA CÁMARA CINEMÁTICA CON LA FOTO REAL */}
        <div className="tvad-camera-viewport">
          <div 
            className="tvad-camera-rig"
            style={{
              transform: `${currentShot.cameraTransform} translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`
            }}
          >
            {/* FOTOGRAFÍA REAL DE ALTA RESOLUCIÓN */}
            <img 
              src="/hero_burger.png" 
              alt="Hamburguesa Real Biru en plato de chapa con huevo frito, cheddar y papas rústicas" 
              className="tvad-real-burger-image"
            />

            {/* Efectos de Iluminación Volumétrica sobre la Fotografía Real */}
            <div className="tvad-real-image-glow-overlay" />
          </div>
        </div>

        {/* EFECTO DE PARTÍCULAS DE HUMO Y CALOR REALES */}
        <div className="tvad-smoke-atmosphere" aria-hidden="true">
          <div className="smoke-wave sw1" />
          <div className="smoke-wave sw2" />
          <div className="smoke-wave sw3" />
        </div>

        {/* TÍTULO Y CAPTION CINEMÁTICO DE CADA TOMA (LOWER THIRDS) */}
        {!isFinalScene && (
          <div className="tvad-shot-caption-overlay" key={currentShotIndex}>
            <div className="caption-tag-pill">
              <Sparkles size={13} className="caption-star" />
              <span>INGREDIENTE REAL</span>
            </div>
            <h3 className="caption-main-title">{currentShot.tagline}</h3>
            <p className="caption-sub-description">{currentShot.subtext}</p>
          </div>
        )}

        {/* ESCENA FINAL: LOGO BIRU REDISEÑADO EN 3D MODERNO SOBRE LA FOTO REAL */}
        <div className={`biru-3d-logo-reveal-spot ${isFinalScene ? 'active-reveal' : ''}`}>
          <div className="biru-3d-metallic-emblem">
            <div className="emblem-halo-glow" />
            <div className="emblem-gold-bezel">
              <div className="emblem-inner-core">
                <div className="emblem-est-tag">
                  <span className="star-icon">★</span>
                  <span>20 • TBÓ • 13</span>
                  <span className="star-icon">★</span>
                </div>

                <div className="emblem-brand-wordmark">
                  <h2 className="biru-sculpted-3d-text" data-text="Biru">
                    Biru
                  </h2>
                  <div className="emblem-light-sweep" />
                </div>

                <div className="emblem-delivery-tag">
                  <span>BAR &amp; DELIVERY</span>
                </div>
              </div>
            </div>
            <div className="emblem-drop-shadow-3d" />
          </div>
        </div>

        {/* ESCENA FINAL: TEXTOS "HORARIOS" Y TARJETAS EN 3D MODERNO */}
        <div className={`biru-3d-text-showcase-panel ${isFinalScene ? 'active-panel' : ''}`}>
          <div className="showcase-horarios-header">
            <h3 className="horarios-volumetric-3d-title" data-text="HORARIOS">
              HORARIOS
            </h3>
          </div>

          <div className="showcase-info-cards-3d">
            <div className="info-glass-card-3d card-salon">
              <div className="card-glass-specular" />
              <div className="card-icon-pill red">
                <Flame size={16} />
              </div>
              <div className="card-meta-text">
                <span className="card-micro-label">SALÓN RETRO PUB</span>
                <strong className="card-bold-value">Miércoles a Domingos</strong>
              </div>
            </div>

            <div className="info-glass-card-3d card-delivery">
              <div className="card-glass-specular" />
              <div className="card-icon-pill green">
                <span className="live-status-dot" />
              </div>
              <div className="card-meta-text">
                <span className="card-micro-label">DELIVERY ONLINE</span>
                <strong className="card-bold-value green">Todos los Días</strong>
              </div>
            </div>

            <div className="info-glass-card-3d card-horario">
              <div className="card-glass-specular" />
              <div className="card-icon-pill amber">
                <Clock size={16} />
              </div>
              <div className="card-meta-text">
                <span className="card-micro-label">HORARIO NOCTURNO</span>
                <strong className="card-bold-value amber">A partir de 20:00 hs</strong>
              </div>
            </div>
          </div>

          {/* DOCK INFERIOR DE CONTACTO 3D */}
          <div className="showcase-contact-dock-3d">
            <a 
              href="https://wa.me/59892033390" 
              target="_blank" 
              rel="noopener noreferrer"
              className="dock-chip-3d chip-wpp"
            >
              <MessageCircle size={15} />
              <span>092 033 390</span>
            </a>

            <a 
              href="tel:46325415" 
              className="dock-chip-3d chip-tel"
            >
              <Phone size={15} />
              <span>4632 5415</span>
            </a>

            <a 
              href="https://maps.google.com/?q=Catalina+98+Tacuarembo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="dock-chip-3d chip-map"
            >
              <MapPin size={15} />
              <span>Catalina 98</span>
            </a>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS DEL SPOT DE TV */}
        <div className="tvad-player-toolbar">
          <div className="toolbar-left-controls">
            <button 
              type="button" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="player-control-btn"
              title={isPlaying ? 'Pausar Spot TV' : 'Reproducir Spot TV'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pausa' : 'Play'}</span>
            </button>

            <button 
              type="button" 
              onClick={restartSpot}
              className="player-control-btn"
              title="Repetir Comercial de TV"
            >
              <RotateCcw size={14} />
              <span>Repetir Spot</span>
            </button>

            <button 
              type="button" 
              onClick={toggleSound}
              className={`player-control-btn sound-btn ${soundEnabled ? 'sound-active' : ''}`}
              title={soundEnabled ? 'Silenciar Efectos de TV' : 'Activar Efectos Cinemáticos'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
            </button>
          </div>

          {/* Stepper / Timeline de Tomas de TV */}
          <div className="tvad-timeline-stepper">
            {TV_SHOTS.map((shot, idx) => (
              <button
                key={shot.id}
                type="button"
                className={`timeline-step-btn ${currentShotIndex === idx ? 'active-shot' : ''} ${currentShotIndex > idx ? 'passed-shot' : ''}`}
                onClick={() => jumpToShot(idx)}
                title={`Ver toma: ${shot.label}`}
              >
                <span className="step-number">{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
