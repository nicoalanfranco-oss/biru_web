import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HeroVideoShowcaseProps {
  onExploreMenu?: () => void;
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ onExploreMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Garantizar reproducción automática al montar
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // En caso de bloqueo por política de navegador, asegurarse de que esté muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    triggerHaptic();
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    triggerHaptic();
  };

  const restartVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    triggerHaptic();
  };

  return (
    <div
      className="hero-video-showcase-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Marco cinematográfico con resplandor dorado */}
      <div className="hero-video-bezel-frame">
        {/* Cabecera superior del spot */}
        <div className="hero-video-top-bar">
          <div className="hero-video-live-tag">
            <span className="live-dot" />
            <span>BIRU TV AD SPOT • 4K HDR</span>
          </div>
          <div className="hero-video-edition-tag">
            <Sparkles size={12} className="tag-sparkle" />
            <span>ORIGINAL RETRO PUB</span>
          </div>
        </div>

        {/* Video HTML5 optimizado y ligero (1.45 MB) */}
        <div className="hero-video-canvas" onClick={togglePlay}>
          <video
            ref={videoRef}
            src="/Presentacion.mp4"
            poster="/hero_video_poster.jpg"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="hero-video-element"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Degradado y viñeta de iluminación de estudio */}
          <div className="hero-video-vignette" />

          {/* Overlay de pausa cuando el video está detenido */}
          {!isPlaying && (
            <div className="hero-video-play-overlay">
              <button
                type="button"
                className="hero-video-big-play-btn"
                onClick={togglePlay}
                aria-label="Reanudar video"
              >
                <Play size={36} fill="#F59E0B" color="#F59E0B" />
              </button>
            </div>
          )}
        </div>

        {/* Barra inferior de controles rápidos cinematográficos */}
        <div className={`hero-video-controls-bar ${isHovered ? 'is-visible' : ''}`}>
          <div className="controls-left">
            <button
              type="button"
              className="ctrl-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pausar spot' : 'Reproducir spot'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'Pausa' : 'Play'}</span>
            </button>

            <button
              type="button"
              className="ctrl-btn"
              onClick={restartVideo}
              title="Volver al inicio del comercial"
            >
              <RotateCcw size={15} />
              <span>Repetir</span>
            </button>
          </div>

          <div className="controls-right">
            <button
              type="button"
              className="ctrl-btn"
              onClick={toggleMute}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Audio OFF' : 'Audio ON'}</span>
            </button>

            {onExploreMenu && (
              <button
                type="button"
                className="ctrl-btn order-cta"
                onClick={onExploreMenu}
              >
                <span>Pedir Ahora</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
