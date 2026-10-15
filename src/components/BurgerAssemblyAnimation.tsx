import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Layers, Sparkles, Flame, Clock, MapPin, Phone, MessageCircle, Eye, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerAssemblyAnimationProps {
  onExploreMenu?: () => void;
}

export const BurgerAssemblyAnimation: React.FC<BurgerAssemblyAnimationProps> = ({ onExploreMenu }) => {
  // Pasos: 0=Bandeja, 1=Pan Base, 2=Vegetales, 3=Carne, 4=Queso, 5=Panceta, 6=Huevo, 7=Pan Corona, 8=Palillo, 9=Final 3D
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [showOriginalPhoto, setShowOriginalPhoto] = useState<boolean>(false);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_STEPS = 9;

  // Secuencia automática de armado
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep < TOTAL_STEPS) {
      const stepDuration = currentStep === 0 ? 600 : 550;
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next === TOTAL_STEPS) {
            setIsPlaying(false);
          }
          return next;
        });
        triggerHaptic();
      }, stepDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying]);

  const restartAnimation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsExploded(false);
    setCurrentStep(0);
    setIsPlaying(true);
    triggerHaptic();
  };

  const jumpToStep = (step: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(step);
    triggerHaptic();
  };

  const toggleExploded = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(TOTAL_STEPS);
      setIsPlaying(false);
    }
    setIsExploded(!isExploded);
    triggerHaptic();
  };

  // Parallax interactivo 3D con mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMouseTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Nombres de cada capa para feedback interactivo
  const layerLabels = [
    'Bandeja & Fritas',
    'Pan Base Brioche',
    'Lechuga & Tomate',
    'Medallón de Carne',
    'Cheddar Fundido',
    'Panceta Ahumada',
    'Huevo de Campo',
    'Pan Corona Sésamo',
    'Palillo & Toque Final',
    'Biru 3D Escena Final'
  ];

  return (
    <div className="burger-hero-experience-wrapper">
      {/* Contenedor Principal de la Animación Hero */}
      <div 
        ref={cardRef}
        className={`burger-hero-stage ${isExploded ? 'is-exploded-mode' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`
        }}
      >
        {/* Luces y Reflejos Ambientales 3D */}
        <div className="stage-light-ambient" />
        <div className="stage-light-rim-gold" />
        <div className="stage-light-rim-crimson" />

        {/* Partículas de Vapor y Brasas (aparecen cuando la carne y queso caen) */}
        {currentStep >= 3 && (
          <div className="burger-steam-particles" aria-hidden="true">
            <span className="steam-puff p1" />
            <span className="steam-puff p2" />
            <span className="steam-puff p3" />
            <span className="steam-puff p4" />
          </div>
        )}

        {/* LOGO BIRU REDISEÑADO EN 3D MODERNO */}
        <div className={`biru-3d-logo-overlay ${currentStep >= 9 ? 'logo-visible-3d' : ''}`}>
          <div className="biru-3d-emblem-container">
            <div className="biru-3d-emblem-glow" />
            <div className="biru-3d-badge-frame">
              {/* Anillo exterior biselado con iluminación 3D */}
              <div className="biru-badge-bevel-outer">
                <div className="biru-badge-bevel-inner">
                  <div className="biru-badge-header">
                    <span className="biru-badge-dot">★</span>
                    <span className="biru-badge-tbo">20 • TBÓ • 13</span>
                    <span className="biru-badge-dot">★</span>
                  </div>

                  {/* Tipografía 3D de Biru con extrusión y destello metálico */}
                  <div className="biru-3d-title-wrap">
                    <h2 className="biru-3d-title" data-text="Biru">
                      Biru
                    </h2>
                    <div className="biru-title-sheen-sweep" />
                  </div>

                  <div className="biru-badge-subtext">
                    <span>BAR &amp; DELIVERY</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Sombra proyectada del logo sobre la escena */}
            <div className="biru-logo-cast-shadow" />
          </div>
        </div>

        {/* CANVAS / ESCENARIO DE CONSTRUCCIÓN DE LA HAMBURGUESA CAPA POR CAPA */}
        <div className="burger-assembly-scene">
          {/* Sombra de la base en la mesa */}
          <div className={`shadow-plate-table ${currentStep >= 0 ? 'visible' : ''}`} />

          {/* CAPA 0: BANDEJA METÁLICA RETRO + PAPEL ENCERADO + PAPAS FRITAS */}
          <div className={`burger-layer-item layer-0-plate ${currentStep >= 0 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 540 200" className="burger-svg-layer plate-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="metalRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#718096" />
                  <stop offset="35%" stopColor="#CBD5E1" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="85%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="metalFloorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Borde exterior de la fuente de metal */}
              <ellipse cx="270" cy="115" rx="255" ry="60" fill="url(#metalRimGrad)" filter="url(#shadowFilter)" />
              {/* Fondo interior de la fuente */}
              <ellipse cx="270" cy="114" rx="242" ry="54" fill="url(#metalFloorGrad)" />
              {/* Borde reflectante interior */}
              <ellipse cx="270" cy="112" rx="240" ry="52" fill="none" stroke="#94A3B8" strokeWidth="2.5" opacity="0.4" />

              {/* Papel encerado Biru en la base */}
              <path 
                d="M 60,110 Q 120,75 270,82 Q 410,75 480,105 Q 450,150 270,146 Q 90,150 60,110 Z" 
                fill="#F8FAFC" 
                opacity="0.94" 
              />
              <path 
                d="M 50,112 L 85,85 L 140,90 L 115,125 Z" 
                fill="#EDE9FE" 
                opacity="0.5" 
              />
              <text x="140" y="105" fill="#94A3B8" fontSize="12" fontWeight="bold" opacity="0.45" transform="rotate(-6 140 105)">BIRU • BAR</text>
              <text x="350" y="102" fill="#94A3B8" fontSize="12" fontWeight="bold" opacity="0.45" transform="rotate(5 350 102)">EST. 2013</text>

              {/* Papas fritas rústicas crujientes a los lados */}
              {/* Grupo izquierdo de papas */}
              <g className="french-fries-left">
                <rect x="95" y="102" width="55" height="13" rx="4" fill="#D97706" transform="rotate(-18 95 102)" />
                <rect x="110" y="108" width="58" height="14" rx="4" fill="#F59E0B" transform="rotate(12 110 108)" />
                <rect x="80" y="112" width="60" height="12" rx="4" fill="#B45309" transform="rotate(-5 80 112)" />
                <rect x="120" y="115" width="50" height="13" rx="4" fill="#FBBF24" transform="rotate(-25 120 115)" />
                <rect x="100" y="122" width="48" height="11" rx="3" fill="#D97706" transform="rotate(8 100 122)" />
              </g>

              {/* Grupo derecho de papas */}
              <g className="french-fries-right">
                <rect x="385" y="105" width="56" height="13" rx="4" fill="#F59E0B" transform="rotate(20 385 105)" />
                <rect x="365" y="112" width="60" height="14" rx="4" fill="#D97706" transform="rotate(-10 365 112)" />
                <rect x="400" y="110" width="52" height="12" rx="4" fill="#FBBF24" transform="rotate(15 400 110)" />
                <rect x="375" y="122" width="54" height="13" rx="4" fill="#B45309" transform="rotate(-4 375 122)" />
                <rect x="390" y="118" width="46" height="11" rx="3" fill="#F59E0B" transform="rotate(25 390 118)" />
              </g>
            </svg>
            <div className="layer-caption-tag">1. Base &amp; Papas Rústicas</div>
          </div>

          {/* CAPA 1: PAN BASE (BRIOCHE TOSTADO) */}
          <div className={`burger-layer-item layer-1-bottom-bun ${currentStep >= 1 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 400 100" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="bottomBunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="40%" stopColor="#D97706" />
                  <stop offset="85%" stopColor="#92400E" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>
                <linearGradient id="toastedInside" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="50%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#FEF3C7" />
                </linearGradient>
              </defs>
              {/* Sombra inferior del pan */}
              <ellipse cx="200" cy="80" rx="155" ry="16" fill="#180A04" opacity="0.65" />
              {/* Cuerpo del pan inferior */}
              <path 
                d="M 50,45 Q 200,32 350,45 C 362,60 348,78 330,82 Q 200,88 70,82 C 52,78 38,60 50,45 Z" 
                fill="url(#bottomBunGrad)" 
              />
              {/* Corte interior tostado a la manteca */}
              <ellipse cx="200" cy="44" rx="146" ry="16" fill="url(#toastedInside)" stroke="#D97706" strokeWidth="2" />
            </svg>
            <div className="layer-caption-tag">2. Pan Brioche Base</div>
          </div>

          {/* CAPA 2: LECHUGA FRESCA ONDULADA Y TOMATE */}
          <div className={`burger-layer-item layer-2-greens ${currentStep >= 2 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 420 85" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lettuceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="60%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="tomatoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="80%" stopColor="#B91C1C" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>
              </defs>
              {/* Rodaja de tomate asomando */}
              <path 
                d="M 80,48 Q 160,35 240,40 C 235,55 170,62 80,48 Z" 
                fill="url(#tomatoGrad)" 
              />
              <path 
                d="M 220,42 Q 300,36 345,45 C 335,58 260,62 220,42 Z" 
                fill="url(#tomatoGrad)" 
              />
              {/* Hojas de lechuga rizada crocante */}
              <path 
                d="M 35,46 Q 60,30 90,44 Q 125,25 160,40 Q 200,22 240,38 Q 280,24 320,42 Q 355,28 385,46 Q 370,64 340,56 Q 300,68 260,54 Q 220,68 180,52 Q 130,66 90,52 Q 55,64 35,46 Z" 
                fill="url(#lettuceGrad)" 
              />
              <path 
                d="M 70,44 Q 130,34 190,42" 
                stroke="#6EE7B7" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                opacity="0.8" 
              />
              <path 
                d="M 230,40 Q 290,32 350,44" 
                stroke="#6EE7B7" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                opacity="0.8" 
              />
            </svg>
            <div className="layer-caption-tag">3. Lechuga &amp; Tomate Fresco</div>
          </div>

          {/* CAPA 3: MEDALLÓN DE CARNE SMASH 100% VACUNO */}
          <div className={`burger-layer-item layer-3-meat ${currentStep >= 3 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 420 100" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="meatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4A2016" />
                  <stop offset="40%" stopColor="#38150C" />
                  <stop offset="70%" stopColor="#260D07" />
                  <stop offset="100%" stopColor="#140603" />
                </linearGradient>
              </defs>
              {/* Medallón con costra caramelizada y textura artesanal irregular */}
              <path 
                d="M 40,42 C 45,28 90,24 210,24 C 330,24 375,28 380,42 C 388,58 378,74 360,80 C 310,88 110,88 60,80 C 42,74 32,58 40,42 Z" 
                fill="url(#meatGrad)" 
              />
              {/* Marcas de sellado y jugo de cocción */}
              <path d="M 70,52 Q 130,48 190,56 Q 260,46 345,54" stroke="#632B1E" strokeWidth="4" fill="none" opacity="0.85" />
              <path d="M 90,66 Q 160,60 230,68 Q 300,58 335,66" stroke="#260D07" strokeWidth="3" fill="none" opacity="0.9" />
              {/* Brillo de jugosidad */}
              <ellipse cx="140" cy="38" rx="28" ry="4" fill="#994D38" opacity="0.6" />
              <ellipse cx="270" cy="36" rx="35" ry="4" fill="#994D38" opacity="0.6" />
            </svg>
            <div className="layer-caption-tag">4. Medallón 100% Vacuno</div>
          </div>

          {/* CAPA 4: QUESO CHEDDAR DERRETIDO */}
          <div className={`burger-layer-item layer-4-cheese ${currentStep >= 4 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 430 110" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="cheddarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="45%" stopColor="#F59E0B" />
                  <stop offset="85%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
              {/* Manto de queso fundido con caídas/gotas derretidas */}
              <path 
                d="M 50,34 
                   C 100,26 320,26 370,34 
                   C 390,44 380,68 360,70 
                   C 350,71 345,95 335,98 
                   C 325,101 320,68 290,66 
                   C 275,65 265,88 250,92 
                   C 240,95 235,64 210,62 
                   C 195,61 185,82 170,86 
                   C 160,89 155,62 130,60 
                   C 115,59 105,96 90,98 
                   C 80,100 70,64 50,56 
                   C 35,50 40,38 50,34 Z" 
                fill="url(#cheddarGrad)" 
              />
              {/* Reflejos de brillo líquido del queso fundido */}
              <path d="M 80,40 Q 200,32 340,40" stroke="#FEF08A" strokeWidth="3" fill="none" opacity="0.75" />
              <circle cx="95" cy="88" r="3.5" fill="#FEF08A" opacity="0.8" />
              <circle cx="254" cy="82" r="3.5" fill="#FEF08A" opacity="0.8" />
              <circle cx="338" cy="88" r="3.5" fill="#FEF08A" opacity="0.8" />
            </svg>
            <div className="layer-caption-tag">5. Queso Fundido al Fuego</div>
          </div>

          {/* CAPA 5: PANCETA CROCANTE / JAMÓN AHUMADO */}
          <div className={`burger-layer-item layer-5-bacon ${currentStep >= 5 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 420 90" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="baconGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#991B1B" />
                  <stop offset="35%" stopColor="#EF4444" />
                  <stop offset="65%" stopColor="#F87171" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>
                <linearGradient id="baconGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7F1D1D" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
              </defs>
              {/* Tiras onduladas de panceta crocante y jamón ahumado */}
              <path 
                d="M 60,40 Q 110,22 170,44 Q 230,60 300,38 Q 350,25 380,48 C 360,56 320,48 280,62 Q 220,74 150,54 Q 100,48 60,40 Z" 
                fill="url(#baconGrad1)" 
              />
              <path 
                d="M 40,46 Q 90,32 150,50 Q 210,64 270,44 Q 320,34 350,56 C 330,64 290,56 250,68 Q 190,78 130,58 Q 80,54 40,46 Z" 
                fill="url(#baconGrad2)" 
                opacity="0.85" 
              />
              {/* Grasa dorada crujiente */}
              <path d="M 80,42 Q 130,34 180,46 Q 240,58 310,42" stroke="#FDE68A" strokeWidth="2.5" fill="none" opacity="0.75" />
            </svg>
            <div className="layer-caption-tag">6. Panceta &amp; Jamón Ahumado</div>
          </div>

          {/* CAPA 6: HUEVO FRITO DE CAMPO CON YEMA LÍQUIDA (PIEZA CENTRAL DE LA FOTO) */}
          <div className={`burger-layer-item layer-6-egg ${currentStep >= 6 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 430 130" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="yolkGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="35%" stopColor="#F59E0B" />
                  <stop offset="75%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </radialGradient>
                <linearGradient id="eggWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#F8FAFC" />
                  <stop offset="90%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <filter id="yolkGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#D97706" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Clara de huevo frita con bordes dorados crujientes (puntilla) */}
              <path 
                d="M 50,60 
                   C 60,35 120,25 210,25 
                   C 310,25 370,40 380,65 
                   C 390,95 340,115 280,118 
                   C 210,122 130,120 75,108 
                   C 40,100 40,75 50,60 Z" 
                fill="url(#eggWhiteGrad)" 
                stroke="#D97706" 
                strokeWidth="2" 
              />
              {/* Borde crocante tostado (puntilla de bar) */}
              <path 
                d="M 55,68 C 65,85 105,105 160,112 M 290,115 C 335,110 375,90 378,72" 
                stroke="#B45309" 
                strokeWidth="2.5" 
                strokeDasharray="4,3" 
                fill="none" 
              />

              {/* Yema líquida dorada brillante (idéntica a la imagen del local) */}
              <g filter="url(#yolkGlow)">
                <ellipse cx="265" cy="72" rx="46" ry="36" fill="url(#yolkGrad)" />
                {/* Gran brillo especular de yema líquida tierna */}
                <ellipse cx="254" cy="62" rx="15" ry="9" fill="#FFFFFF" opacity="0.9" transform="rotate(-15 254 62)" />
                <circle cx="282" cy="78" r="4.5" fill="#FFFFFF" opacity="0.5" />
              </g>

              {/* Pimienta negra recién molida */}
              <circle cx="200" cy="55" r="1.5" fill="#27272A" />
              <circle cx="220" cy="85" r="1.5" fill="#27272A" />
              <circle cx="160" cy="70" r="1.8" fill="#27272A" />
              <circle cx="140" cy="90" r="1.4" fill="#27272A" />
              <circle cx="320" cy="65" r="1.6" fill="#27272A" />
            </svg>
            <div className="layer-caption-tag">7. Huevo Frito de Campo</div>
          </div>

          {/* CAPA 7: PAN CORONA BRIOCHE CON SÉSAMO TOSTADO */}
          <div className={`burger-layer-item layer-7-top-bun ${currentStep >= 7 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 420 170" className="burger-svg-layer" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="topBunCrown" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="25%" stopColor="#F59E0B" />
                  <stop offset="65%" stopColor="#D97706" />
                  <stop offset="85%" stopColor="#92400E" />
                  <stop offset="100%" stopColor="#5B2207" />
                </radialGradient>
                <filter id="bunGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Domo de pan brioche horneado brillante */}
              <path 
                d="M 50,130 
                   C 40,75 100,25 210,25 
                   C 320,25 380,75 370,130 
                   C 365,148 310,158 210,158 
                   C 110,158 55,148 50,130 Z" 
                fill="url(#topBunCrown)" 
                filter="url(#bunGlow)" 
              />

              {/* Brillo especular superior del horneado con manteca */}
              <ellipse cx="205" cy="55" rx="100" ry="22" fill="#FEF3C7" opacity="0.35" />

              {/* Semillas de sésamo tostadas esparcidas sobre la corona */}
              <g className="sesame-seeds" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.5">
                <ellipse cx="140" cy="65" rx="5" ry="2.5" transform="rotate(-20 140 65)" />
                <ellipse cx="170" cy="50" rx="5" ry="2.5" transform="rotate(15 170 50)" />
                <ellipse cx="205" cy="46" rx="5" ry="2.5" transform="rotate(-5 205 46)" />
                <ellipse cx="240" cy="52" rx="5" ry="2.5" transform="rotate(30 240 52)" />
                <ellipse cx="275" cy="68" rx="5" ry="2.5" transform="rotate(-15 275 68)" />
                <ellipse cx="120" cy="85" rx="5" ry="2.5" transform="rotate(40 120 85)" />
                <ellipse cx="155" cy="80" rx="5" ry="2.5" transform="rotate(-10 155 80)" />
                <ellipse cx="190" cy="72" rx="5" ry="2.5" transform="rotate(25 190 72)" />
                <ellipse cx="225" cy="74" rx="5" ry="2.5" transform="rotate(-30 225 74)" />
                <ellipse cx="260" cy="82" rx="5" ry="2.5" transform="rotate(10 260 82)" />
                <ellipse cx="295" cy="88" rx="5" ry="2.5" transform="rotate(-40 295 88)" />
                <ellipse cx="140" cy="105" rx="5" ry="2.5" transform="rotate(15 140 105)" />
                <ellipse cx="180" cy="98" rx="5" ry="2.5" transform="rotate(-20 180 98)" />
                <ellipse cx="215" cy="96" rx="5" ry="2.5" transform="rotate(5 215 96)" />
                <ellipse cx="250" cy="102" rx="5" ry="2.5" transform="rotate(-25 250 102)" />
                <ellipse cx="280" cy="110" rx="5" ry="2.5" transform="rotate(35 280 110)" />
              </g>
            </svg>
            <div className="layer-caption-tag">8. Corona Brioche &amp; Sésamo</div>
          </div>

          {/* CAPA 8: PALILLO RÚSTICO DE MADERA (PINCHA EN EL CENTRO) */}
          <div className={`burger-layer-item layer-8-skewer ${currentStep >= 8 ? 'layer-dropped' : 'layer-hidden'}`}>
            <svg viewBox="0 0 100 240" className="skewer-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>
              {/* Palillo de brocheta de bambú */}
              <rect x="46" y="20" width="8" height="210" rx="2" fill="url(#woodGrad)" />
              {/* Punta afilada */}
              <polygon points="46,230 54,230 50,240" fill="#78350F" />
              {/* Toque superior artesanal */}
              <circle cx="50" cy="18" r="6" fill="#92400E" />
            </svg>
            <div className="layer-caption-tag">9. Palillo Artesanal Biru</div>
          </div>
        </div>

        {/* MODAL / OVERLAY COMPARATIVO DE FOTO ORIGINAL */}
        {showOriginalPhoto && (
          <div className="original-photo-overlay" onClick={() => setShowOriginalPhoto(false)}>
            <div className="original-photo-card" onClick={(e) => e.stopPropagation()}>
              <div className="photo-card-header">
                <span>Fotografía Original de Referencia</span>
                <button 
                  type="button" 
                  onClick={() => setShowOriginalPhoto(false)}
                  className="close-photo-btn"
                >
                  ✕
                </button>
              </div>
              <img 
                src="/hero_burger.png" 
                alt="Burger Original Biru" 
                className="original-photo-img" 
              />
              <p className="photo-card-caption">
                Hamburguesa real en plato de chapa con huevo frito, panceta y papas rústicas servida en Catalina 98.
              </p>
            </div>
          </div>
        )}

        {/* TARJETAS DE INFORMACIÓN Y HORARIOS REDISEÑADAS EN 3D MODERNO */}
        <div className={`biru-3d-info-hud ${currentStep >= 9 ? 'hud-visible-3d' : ''}`}>
          {/* Título Monumental 3D: HORARIOS */}
          <div className="hud-horarios-header">
            <h3 className="hud-horarios-3d-text" data-text="HORARIOS">
              HORARIOS
            </h3>
          </div>

          {/* Tarjetas de Salón y Delivery en 3D Glassmorphism con iluminación */}
          <div className="hud-cards-grid">
            <div className="hud-glass-card card-salon">
              <div className="hud-card-shine" />
              <div className="hud-card-icon-wrap">
                <Flame size={18} className="hud-icon-salon" />
              </div>
              <div className="hud-card-content">
                <span className="hud-label-dim">SALÓN RETRO PUB</span>
                <strong className="hud-value-highlight">Miércoles a Domingos</strong>
              </div>
            </div>

            <div className="hud-glass-card card-delivery">
              <div className="hud-card-shine" />
              <div className="hud-card-icon-wrap green">
                <span className="hud-live-dot" />
              </div>
              <div className="hud-card-content">
                <span className="hud-label-dim">DELIVERY DIRECTO</span>
                <strong className="hud-value-highlight green">Todos los Días</strong>
              </div>
            </div>

            <div className="hud-glass-card card-time">
              <div className="hud-card-shine" />
              <div className="hud-card-icon-wrap amber">
                <Clock size={16} />
              </div>
              <div className="hud-card-content">
                <span className="hud-label-dim">HORARIO NOCTURNO</span>
                <strong className="hud-value-highlight amber">A partir de 20:00 hs</strong>
              </div>
            </div>
          </div>

          {/* Barra Inferior 3D con accesos de contacto */}
          <div className="hud-contact-bar-3d">
            <a 
              href="https://wa.me/59892033390" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hud-contact-chip chip-whatsapp"
            >
              <MessageCircle size={15} />
              <span>092 033 390</span>
            </a>

            <a 
              href="tel:46325415" 
              className="hud-contact-chip chip-phone"
            >
              <Phone size={15} />
              <span>4632 5415</span>
            </a>

            <a 
              href="https://maps.google.com/?q=Catalina+98+Tacuarembo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hud-contact-chip chip-location"
            >
              <MapPin size={15} />
              <span>Catalina 98 • Tacuarembó</span>
            </a>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS Y CONTROL DE LA EXPERIENCIA HERO */}
        <div className="burger-controls-toolbar">
          <button 
            type="button" 
            onClick={restartAnimation}
            className="ctrl-btn-action"
            title="Reiniciar Secuencia de Armado"
          >
            <RotateCcw size={15} />
            <span>{currentStep >= TOTAL_STEPS ? 'Volver a Armar' : 'Reiniciar'}</span>
          </button>

          <button 
            type="button" 
            onClick={toggleExploded}
            className={`ctrl-btn-action ${isExploded ? 'active' : ''}`}
            title="Ver capas de la hamburguesa desglosadas en el espacio 3D"
          >
            <Layers size={15} />
            <span>{isExploded ? 'Vista Compacta' : 'Vista en Capas 3D'}</span>
          </button>

          <button 
            type="button" 
            onClick={() => setShowOriginalPhoto(true)}
            className="ctrl-btn-action"
            title="Comparar con fotografía original del plato"
          >
            <Eye size={15} />
            <span>Foto Base</span>
          </button>
        </div>

        {/* STEPPER INTERACTIVO DE CAPAS EN LA PARTE INFERIOR */}
        <div className="burger-layer-stepper">
          {layerLabels.map((label, idx) => (
            <button
              key={idx}
              type="button"
              className={`stepper-dot ${currentStep === idx ? 'current' : ''} ${currentStep > idx ? 'completed' : ''}`}
              onClick={() => jumpToStep(idx)}
              title={`Ver: ${label}`}
            >
              <span className="dot-tooltip">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
