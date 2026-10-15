import React, { useRef, useEffect } from 'react';

interface HeroVideoShowcaseProps {
  onExploreMenu?: () => void;
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <div className="hero-floating-video-wrapper">
      {/* Resplandor cálido ambiental detrás del video flotante */}
      <div className="hero-floating-video-glow" aria-hidden="true" />

      {/* Contenedor sin recuadros ni bordes */}
      <div className="hero-floating-video-canvas">
        <video
          ref={videoRef}
          src="/Presentacion.mp4"
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
