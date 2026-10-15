import React from 'react';
import { MarcaInfo, TenantInfo } from '../types/food';
import { MapPin, Phone, Clock } from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
              <span>{tenant?.direccion || 'Dr. Domingo Catalina 98'}, Tacuarembó</span>
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
                <InstagramIcon size={16} />
                <span>@birubartbo en Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Nico Labs Developer Badge */}
        <div className="footer-nicolabs-container">
          <a
            href="https://nicolabs.nico-family.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-nicolabs-link"
            title="Desarrollado y Creado por Nico Labs"
          >
            <span className="footer-nicolabs-created">Creado por</span>
            <img
              src="/logo_nicolabs.png"
              alt="Nico Labs"
              className="footer-nicolabs-logo"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};
