import React from 'react';
import { MarcaInfo, TenantInfo } from '../types/food';
import { MapPin, Phone, Clock } from 'lucide-react';

/* Instagram brand icon con gradiente oficial */
const InstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" fill="url(#ig-grad)" />
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
  </svg>
);

interface FooterProps {
  marca?: MarcaInfo;
  tenant?: TenantInfo;
}

export const Footer: React.FC<FooterProps> = ({ marca, tenant }) => {
  return (
    <footer className="site-footer site-footer--simple">
      <div className="page-container">
        {/* Info del Local */}
        <div className="footer-brand-info">
          <div className="footer-brand-header">
            <img src="/logo_biru.jpg" alt="Biru Bar & Delivery" className="footer-logo-img" />
            <div>
              <h3 className="footer-title">{marca?.nombre || 'Biru Bar & Delivery'}</h3>
              <p className="footer-tagline">Burgers artesanales, pizzas de masa madre y cervezas • Est. 2013</p>
            </div>
          </div>

          <div className="footer-details-grid">
            <div className="footer-detail-item">
              <MapPin size={16} className="footer-icon" />
              <a
                href={tenant?.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent((tenant?.direccion || 'Dr. Domingo Catalina 98') + ', Tacuarembó, Uruguay')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-maps-link"
                title="Ver en Google Maps"
              >
                {tenant?.direccion || 'Dr. Domingo Catalina 98'}, Tacuarembó
              </a>
            </div>
            <div className="footer-detail-item">
              <Phone size={16} className="footer-icon" />
              <span>{tenant?.telefono || '092 033 390 / 4632 5415'}</span>
            </div>
            <div className="footer-detail-item">
              <Clock size={16} className="footer-icon" />
              <span>{marca?.dias_atencion || 'Martes a Domingo'}: {marca?.horario_atencion || '19:30 a 01:00 hs'}</span>
            </div>
            <div className="footer-detail-item">
              <a
                href="https://www.instagram.com/birubartbo/"
                target="_blank"
                rel="noreferrer"
                className="footer-instagram-link"
              >
                <span className="footer-instagram-icon-wrap">
                  <InstagramIcon size={22} />
                </span>
                <span className="footer-instagram-text">
                  <span className="footer-instagram-handle">@birubartbo</span>
                  <span className="footer-instagram-sub">Seguinos en Instagram</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Nico Labs Developer Badge — premium */}
        <div className="footer-nicolabs-container">
          <a
            href="https://nicolabs.nico-family.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-nicolabs-link"
            title="Desarrollado y Creado por Nico Labs"
          >
            <div className="footer-nicolabs-badge">
              <span className="footer-nicolabs-label">Tecnología por</span>
              <img
                src="/logo_nicolabs.png"
                alt="Nico Labs"
                className="footer-nicolabs-logo"
              />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
};
