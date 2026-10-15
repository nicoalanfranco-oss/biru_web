import React from 'react';

interface BiruEmblem3DProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const BiruEmblem3D: React.FC<BiruEmblem3DProps> = ({
  className = '',
  size = 'md',
  animated = true,
}) => {
  return (
    <div
      className={`biru-3d-emblem-badge size-${size} ${animated ? 'is-animated' : ''} ${className}`}
      aria-label="Biru Bar y Delivery - Desde 2013"
    >
      <div className="emblem-3d-bevel-frame">
        <div className="emblem-3d-gold-rim">
          <div className="emblem-3d-inner-chamber">
            <span className="emblem-3d-est">★ 20 • TBÓ • 13 ★</span>
            <span className="emblem-3d-script-wordmark">Biru</span>
            <span className="emblem-3d-sub-bar">BAR &amp; DELIVERY</span>
            <div className="emblem-3d-sheen-shine" />
          </div>
        </div>
      </div>
    </div>
  );
};
