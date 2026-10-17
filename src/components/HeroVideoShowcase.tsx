import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroVideoShowcaseProps {
  onExploreMenu?: () => void;
  onFirstCycleComplete?: () => void;
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ onFirstCycleComplete }) => {
  const video0Ref = useRef<HTMLVideoElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);

  // 0 -> Biru.mp4 (Hamburguesa animada limpia sin marcas, 4.5s)
  // 1 -> Presentacion.mp4 (Spot del bar / pizzas y cerveza, ~10s)
  const [activeClipIndex, setActiveClipIndex] = useState<0 | 1>(0);
  const hasFinishedFirstClipRef = useRef<boolean>(false);

  // Reproducción segura con mute para políticas estrictas de navegadores
  const safePlay = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, []);

  // Iniciar la reproducción del primer clip al montar
  useEffect(() => {
    const v0 = video0Ref.current;
    if (v0) {
      v0.currentTime = 0;
      safePlay(v0);
    }
  }, [safePlay]);

  // Manejo de finalización del clip 0 (Biru.mp4)
  const handleClip0Ended = useCallback(() => {
    // Al terminar la primera vuelta, dispara el desplazamiento y entrada del texto
    if (!hasFinishedFirstClipRef.current) {
      hasFinishedFirstClipRef.current = true;
      onFirstCycleComplete?.();
    }

    // Pasa al clip 1 (Presentación) de manera continua y suave
    const v1 = video1Ref.current;
    if (v1) {
      v1.currentTime = 0;
      safePlay(v1);
    }
    setActiveClipIndex(1);
  }, [onFirstCycleComplete, safePlay]);

  // Manejo de finalización del clip 1 (Presentacion.mp4)
  const handleClip1Ended = useCallback(() => {
    // Vuelve al clip 0 (Hamburguesa) y continúa el ciclo consecutivo
    const v0 = video0Ref.current;
    if (v0) {
      v0.currentTime = 0;
      safePlay(v0);
    }
    setActiveClipIndex(0);
  }, [safePlay]);

  return (
    <div className="hero-floating-video-wrapper">
      {/* Resplandor cálido ambiental detrás del video flotante */}
      <div className="hero-floating-video-glow" aria-hidden="true" />

      {/* Contenedor sin recuadros ni bordes */}
      <div className="hero-floating-video-canvas">
        {/* Clip 0: Animación de Hamburguesa limpia (sin 'k' inicial ni texto 'Biru.' final) */}
        <video
          ref={video0Ref}
          src="/Biru.mp4"
          poster="/hero_video_poster.jpg"
          muted
          playsInline
          preload="auto"
          onEnded={handleClip0Ended}
          className={`hero-floating-video-element ${activeClipIndex === 0 ? 'video-active' : 'video-standby'}`}
        />

        {/* Clip 1: Spot de presentación (cultura Biru, pizzas, salón y delivery) */}
        <video
          ref={video1Ref}
          src="/Presentacion.mp4"
          poster="/hero_video_poster.jpg"
          muted
          playsInline
          preload="auto"
          onEnded={handleClip1Ended}
          className={`hero-floating-video-element ${activeClipIndex === 1 ? 'video-active' : 'video-standby'}`}
        />

        {/* Viñeta suave para fundirse orgánicamente con el fondo de la web */}
        <div className="hero-floating-edge-fade" aria-hidden="true" />
      </div>
    </div>
  );
};


