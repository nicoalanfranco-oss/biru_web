/**
 * useStructuredData — Hook que inyecta JSON-LD dinámico en el <head> para Biru
 */

import { useEffect } from 'react';
import { ProductoElaborado, ProductoReventa, TenantInfo, MarcaInfo } from '../types/food';

interface StructuredDataOptions {
  tenant: TenantInfo;
  marca: MarcaInfo;
  platos: ProductoElaborado[];
  reventa: ProductoReventa[];
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://biru.nico-family.com';
const CURRENCY = 'UYU';

function parseHorario(horarioStr: string): { opens: string; closes: string } | null {
  const match = horarioStr.match(/(\d{1,2}:\d{2})\s*(?:a|-|–)\s*(\d{1,2}:\d{2})/i);
  if (!match) return null;
  return { opens: match[1], closes: match[2] };
}

function parseDiasAtencion(diasStr: string): string[] {
  const lower = diasStr.toLowerCase();

  const diasMap: Record<string, string> = {
    lunes: 'Monday', martes: 'Tuesday', miércoles: 'Wednesday',
    miercoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday',
    sábado: 'Saturday', sabado: 'Saturday', domingo: 'Sunday',
  };

  const rangoMatch = lower.match(/(\w+)\s+a\s+(\w+)/);
  if (rangoMatch) {
    const orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const desde = rangoMatch[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasta = rangoMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const idxDesde = orden.indexOf(desde);
    const idxHasta = orden.indexOf(hasta);
    if (idxDesde !== -1 && idxHasta !== -1) {
      return orden.slice(idxDesde, idxHasta + 1)
        .map(d => diasMap[d] || d);
    }
  }

  return lower.split(/[,y]+/)
    .map(d => d.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    .map(d => diasMap[d])
    .filter(Boolean);
}

function buildMenuItems(platos: ProductoElaborado[]) {
  return platos
    .filter(p => p.activo)
    .map(p => ({
      '@type': 'MenuItem',
      name: p.nombre,
      description: p.descripcion || undefined,
      offers: {
        '@type': 'Offer',
        price: Number(p.precio_venta).toFixed(2),
        priceCurrency: CURRENCY,
        availability: 'https://schema.org/InStock',
      },
    }));
}

export function useStructuredData({ tenant, marca, platos }: StructuredDataOptions) {
  useEffect(() => {
    const horarioParsed = parseHorario(marca.horario_atencion || '19:30 a 01:00 hs');
    const diasParsed = parseDiasAtencion(marca.dias_atencion || 'Martes a Domingo');

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Restaurant', 'BarOrPub'],
          '@id': `${SITE_URL}/#restaurant`,
          name: marca.nombre || tenant.nombre || 'Biru Bar & Delivery',
          description: 'Biru Bar & Delivery - Burgers artesanales doble carne, tablas, chivitos, tacos, pizzetas de masa madre y cervezas en Tacuarembó.',
          url: SITE_URL,
          telephone: tenant.telefono || '092 033 390 / 4632 5415',
          priceRange: '$$',
          servesCuisine: ['Burgers', 'Pizzas Artesanales', 'Chivitos', 'Bar & Pub Food', 'Cervezas Artesanales'],
          address: {
            '@type': 'PostalAddress',
            streetAddress: tenant.direccion || 'Dr. Domingo Catalina 98',
            addressLocality: 'Tacuarembó',
            addressRegion: 'Tacuarembó',
            addressCountry: 'UY',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -31.7125431,
            longitude: -55.9870577,
          },
          openingHoursSpecification: horarioParsed
            ? [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: diasParsed.length > 0 ? diasParsed : ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  opens: horarioParsed.opens,
                  closes: horarioParsed.closes,
                },
              ]
            : undefined,
          hasMenu: {
            '@type': 'Menu',
            name: 'Carta Biru Bar & Delivery',
            hasMenuItem: buildMenuItems(platos),
          },
        },
      ],
    };

    let scriptTag = document.getElementById('json-ld-biru') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-biru';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema, null, 2);

    return () => {
      const tag = document.getElementById('json-ld-biru');
      if (tag) tag.remove();
    };
  }, [tenant, marca, platos]);
}
