import React, { useRef, useEffect, useState } from 'react';

interface HeroVideoShowcaseProps {
  onExploreMenu?: () => void;
  onFirstCycleComplete?: () => void;
}

// Configuración de video activo:
// 'biru' -> Video generado con animación AI recortado limpio (sin 'k' inicial ni texto 'biru' final)
// 'presentacion' -> Video spot original anterior (conservado intacto para reactivar cuando quieras)
const ACTIVE_VIDEO: 'biru' | 'presentacion' = 'biru';

// Rango de reproducción limpia para Biru.mp4 (segundos):
// Elimina la letra 'k' del arranque y el texto 3D 'Biru.' que aparece al final.
const BIRU_TRIM_START = 1.6;
const BIRU_TRIM_END = 5.1;

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ onFirstCycleComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoMode] = useState<'biru' | 'presentacion'>(ACTIVE_VIDEO);
  const cycleNotifiedRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (currentVideoMode === 'biru') {
      const handleLoadedMetadata = () => {
        video.currentTime = BIRU_TRIM_START;
      };

      const handleTimeUpdate = () => {
        // Al terminar exactamente la 1ra repetición (sin esperar segundas vueltas):
        if (video.currentTime >= BIRU_TRIM_END - 0.15 && !cycleNotifiedRef.current) {
          cycleNotifiedRef.current = true;
          onFirstCycleComplete?.();
        }

        // Al alcanzar el final del rango limpio, vuelve suavemente al inicio del recorte
        if (video.currentTime >= BIRU_TRIM_END || video.currentTime < BIRU_TRIM_START - 0.1) {
          video.currentTime = BIRU_TRIM_START;
        }
      };


      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);

      if (video.readyState >= 1) {
        video.currentTime = BIRU_TRIM_START;
      }

      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    } else {
      // Modo video presentación original
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [currentVideoMode]);

  return (
    <div className="hero-floating-video-wrapper">
      {/* Resplandor cálido ambiental detrás del video flotante */}
      <div className="hero-floating-video-glow" aria-hidden="true" />

      {/* Contenedor sin recuadros ni bordes */}
      <div className="hero-floating-video-canvas">
        <video
          ref={videoRef}
          src={currentVideoMode === 'biru' ? '/Biru.mp4' : '/Presentacion.mp4'}
          poster="/hero_video_poster.jpg"
          autoPlay
          loop={currentVideoMode === 'presentacion'}
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

