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
      className={`biru-logo-sheen-wrap size-${size} ${animated ? 'is-animated' : ''} ${className}`}
      aria-label="Biru Bar y Delivery"
    >
      <img
        src="/logo_biru.jpg"
        alt="Biru"
        className="biru-logo-sheen-img"
        draggable={false}
      />
      {animated && <div className="biru-logo-sheen-shine" />}
    </div>
  );
};
