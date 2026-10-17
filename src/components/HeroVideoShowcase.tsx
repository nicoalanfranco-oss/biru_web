import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroVideoShowcaseProps {
  onExploreMenu?: () => void;
  onFirstCycleComplete?: () => void;
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ onFirstCycleComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cycleNotifiedRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Asegurar inicio estricto en el segundo 0 y reproducción con mute
    video.currentTime = 0;
    video.muted = true;

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    }

    const handleTimeUpdate = () => {
      // Al terminar los primeros 4.4s (clip de la hamburguesa), dispara la entrada y acomodo del texto
      if (video.currentTime >= 4.4 && !cycleNotifiedRef.current) {
        cycleNotifiedRef.current = true;
        onFirstCycleComplete?.();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onFirstCycleComplete]);

  return (
    <div className="hero-floating-video-wrapper">
      {/* Resplandor cálido ambiental detrás del video flotante */}
      <div className="hero-floating-video-glow" aria-hidden="true" />

      {/* Contenedor sin recuadros ni bordes */}
      <div className="hero-floating-video-canvas">
        {/* Video unificado continuo: Clip 1 (Hamburguesa) + Clip 2 (Presentación Biru) en loop nativo */}
        <video
          ref={videoRef}
          src="/Biru.mp4"
          poster="/hero_video_poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="hero-floating-video-element"
        />

        {/* Viñeta suave para fundirse orgánicamente con el fondo de la web */}
        <div className="hero-floating-edge-fade" aria-hidden="true" />
      </div>
    </div>
  );
};


