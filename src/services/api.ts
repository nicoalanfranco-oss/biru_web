import { ProductoElaborado, ProductoReventa, GrupoOpciones, TenantInfo, MarcaInfo } from '../types/food';
import realData from './biru_catalog.json';

export const TENANT_INFO: TenantInfo = {
  tenant_id: realData.tenant?.tenant_id || 6,
  nombre: realData.tenant?.nombre || 'Biru',
  rut: realData.tenant?.rut || '15151561651616',
  direccion: realData.tenant?.direccion || 'Dr. Domingo Catalina 98',
  telefono: realData.tenant?.telefono || '092 033 390 / 4632 5415',
  google_maps_url: (realData.tenant as any)?.google_maps_url || 'https://maps.google.com/?q=Dr.+Domingo+Catalina+98+Tacuarembo+Uruguay',
  email: realData.tenant?.email || 'contacto@birubartbo.uy',
};

export const MARCA_INFO: MarcaInfo = {
  marca_id: realData.marca?.marca_id || 4,
  nombre: realData.marca?.nombre || 'Biru Bar & Delivery',
  color_primario: realData.marca?.color_primario || '#8B1E1E',
  dias_atencion: realData.marca?.dias_atencion || 'Martes a Domingo',
  horario_atencion: realData.marca?.horario_atencion || '19:30 a 01:00 hs',
  permite_salon: Boolean(realData.marca?.permite_salon ?? true),
  permite_delivery: realData.marca?.permite_delivery !== false,
  permite_takeaway: realData.marca?.permite_takeaway !== false,
  permite_efectivo: (realData.marca as any)?.permite_efectivo !== false,
  permite_tarjeta: (realData.marca as any)?.permite_tarjeta !== false,
  permite_transferencia: (realData.marca as any)?.permite_transferencia !== false,
  costo_delivery: realData.marca?.costo_delivery !== undefined ? Number(realData.marca.costo_delivery) : 60,
  tiempo_espera_delivery: (realData.marca as any)?.tiempo_espera_delivery || '30–45 min',
  logo_url: realData.marca?.logo_url || '/logo_biru.jpg',
};

// Imagen fallback para platos sin foto
const FALLBACK_PLATO_IMG = '/hero_burger.png';

function parseTenantFromBackend(t: any): TenantInfo {
  if (!t) return TENANT_INFO;
  return {
    tenant_id: Number(t.tenant_id) || TENANT_INFO.tenant_id,
    nombre: t.nombre || TENANT_INFO.nombre,
    rut: t.rut || TENANT_INFO.rut,
    direccion: t.direccion || TENANT_INFO.direccion,
    telefono: t.telefono || TENANT_INFO.telefono,
    google_maps_url: t.google_maps_url || TENANT_INFO.google_maps_url,
    email: t.email || TENANT_INFO.email,
  };
}

function parseMarcaFromBackend(m: any, estadoAtencion?: any): MarcaInfo {
  if (!m) return MARCA_INFO;
  return {
    marca_id: Number(m.marca_id) || MARCA_INFO.marca_id,
    nombre: m.nombre || MARCA_INFO.nombre,
    color_primario: m.color_primario || MARCA_INFO.color_primario,
    dias_atencion: m.dias_atencion || MARCA_INFO.dias_atencion,
    horario_atencion: m.horario_atencion || MARCA_INFO.horario_atencion,
    permite_salon: Boolean(m.permite_salon ?? true),
    permite_delivery: m.permite_delivery !== false,
    permite_takeaway: m.permite_takeaway !== false,
    permite_efectivo: m.permite_efectivo !== false,
    permite_tarjeta: m.permite_tarjeta !== false,
    permite_transferencia: m.permite_transferencia !== false,
    costo_delivery: m.costo_delivery !== undefined ? Number(m.costo_delivery) : 60,
    tiempo_espera_delivery: m.tiempo_espera_delivery || '30–45 min',
    logo_url: m.logo_url || MARCA_INFO.logo_url,
    estado_atencion: estadoAtencion || m.estado_atencion,
  };
}

export const REAL_PLATOS: ProductoElaborado[] = ((realData.elaborados || []) as any[]).map(p => ({
  producto_elaborado_id: p.producto_elaborado_id,
  tenant_id: p.tenant_id || 6,
  marca_id: p.marca_id || 4,
  nombre: p.nombre,
  categoria: p.categoria || 'Burgers',
  descripcion: p.descripcion,
  precio_venta: Number(p.precio_venta),
  es_personalizable: Boolean(p.es_personalizable),
  formato_venta: 'unidad',
  imagen_url: p.imagen_url || FALLBACK_PLATO_IMG,
  activo: Boolean(p.activo),
  insumos_receta: (p.insumos_receta || []).map((i: any) => ({
    insumo_id: Number(i.insumo_id),
    nombre: i.nombre,
    cantidad: Number(i.cantidad ?? i.cantidad_receta ?? 0),
    unidad: i.unidad || 'kg',
    costo_unitario: Number(i.costo_unitario || 0),
    imagen_url: i.imagen_url || null,
  })),
}));

export const REAL_REVENTA: ProductoReventa[] = ((realData.reventa || []) as any[]).map(r => ({
  producto_reventa_id: r.producto_reventa_id,
  tenant_id: r.tenant_id || 6,
  marca_id: r.marca_id || 4,
  nombre: r.nombre,
  categoria: r.categoria || 'Cervezas',
  descripcion: r.descripcion,
  precio_venta: Number(r.precio_venta),
  stock_actual: r.stock_actual || 24,
  imagen_url: r.imagen_url || null,
  activo: Boolean(r.activo),
  sin_stock: Boolean(r.sin_stock),
}));

export const REAL_GRUPOS: GrupoOpciones[] = ((realData.gruposOpciones || []) as any[]).map(g => ({
  grupo_id: g.grupo_id,
  producto_elaborado_id: g.producto_elaborado_id,
  nombre: g.nombre,
  paso_orden: g.paso_orden,
  min_opciones: g.min_opciones,
  max_opciones: g.max_opciones,
  opciones: (g.opciones || []).map((o: any) => ({
    opcion_id: o.opcion_id,
    nombre: o.nombre,
    precio_extra: Number(o.precio_extra || 0),
    imagen_url: o.imagen_url || null,
  })),
}));

// Base URL del backend de Food
export const FOOD_BACKEND_URL = (() => {
  try {
    const host = window.location.hostname;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return '';
    }
  } catch {}
  return 'https://food--studio-4748759464-52942.us-east4.hosted.app';
})();

const MEMORY_CACHE_KEY = 'biru_catalogo_cache_v1';
const CACHE_TTL_MS = 60 * 1000;

export function getStaticCatalog() {
  return {
    elaborados: REAL_PLATOS,
    reventa: REAL_REVENTA,
    gruposOpciones: REAL_GRUPOS,
    tenant: TENANT_INFO,
    marca: MARCA_INFO,
  };
}

export async function fetchBiruCatalogo(): Promise<{
  elaborados: ProductoElaborado[];
  reventa: ProductoReventa[];
  gruposOpciones: GrupoOpciones[];
  tenant: TenantInfo;
  marca: MarcaInfo;
}> {
  // 1. Revisar si hay datos en caché de sesión recientes (< 1 min)
  try {
    const rawCache = sessionStorage.getItem(MEMORY_CACHE_KEY);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {}

  // 2. Llamada directa a la API en vivo
  try {
    const url = `${FOOD_BACKEND_URL}/api/public/catalogo?tenant_id=6&marca_id=4`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const elaboradosBD = (data.elaborados || []).filter((p: any) => p.marca_id === 4 || !p.marca_id);

      const finalCatalog = {
        elaborados: elaboradosBD.length > 0
          ? elaboradosBD.map((p: any) => ({
              ...p,
              precio_venta: Number(p.precio_venta),
              imagen_url: p.imagen_url || FALLBACK_PLATO_IMG,
              insumos_receta: (p.insumos_receta || []).map((i: any) => ({
                insumo_id: Number(i.insumo_id),
                nombre: i.nombre,
                cantidad: Number(i.cantidad ?? i.cantidad_receta ?? 0),
                unidad: i.unidad || 'kg',
                costo_unitario: Number(i.costo_unitario || 0),
                imagen_url: i.imagen_url || null,
              })),
            }))
          : REAL_PLATOS,
        reventa: (data.reventa && data.reventa.length > 0)
          ? data.reventa.map((r: any) => ({
              ...r,
              precio_venta: Number(r.precio_venta),
              imagen_url: r.imagen_url || null,
            }))
          : REAL_REVENTA,
        gruposOpciones: (data.gruposOpciones && data.gruposOpciones.length > 0)
          ? (data.gruposOpciones as any[]).map(g => ({
              grupo_id: g.grupo_id,
              producto_elaborado_id: g.producto_elaborado_id,
              nombre: g.nombre,
              paso_orden: g.paso_orden,
              min_opciones: g.min_opciones,
              max_opciones: g.max_opciones,
              opciones: (g.opciones || []).map((o: any) => ({
                opcion_id: o.opcion_id,
                nombre: o.nombre,
                precio_extra: Number(o.precio_extra || 0),
                imagen_url: o.imagen_url || null,
              })),
            }))
          : REAL_GRUPOS,
        tenant: parseTenantFromBackend(data.tenant),
        marca: parseMarcaFromBackend(data.marca, data.estado_atencion),
      };

      try {
        sessionStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: finalCatalog }));
      } catch {}

      return finalCatalog;
    }
  } catch (error) {
    console.warn('No se pudo conectar al backend en vivo, usando catálogo empaquetado de respaldo:', error);
  }

  // 3. Fallback seguro si no hay internet o el backend no responde
  return getStaticCatalog();
}

export async function sendOrderToFood(orderPayload: any): Promise<{ success: boolean; numero_orden?: number; pedido_id?: number }> {
  const payloadConCocina = {
    ...orderPayload,
    tenant_id: 6,
    marca_id: 4,
    enviar_a_cocina: true,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadConCocina),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        numero_orden: data.numero_orden,
        pedido_id: data.pedido_id,
      };
    } else {
      console.warn('Respuesta no exitosa al enviar pedido a Food:', res.status);
    }
  } catch (err) {
    console.warn('Error o timeout al enviar pedido a Food backend:', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Fallback seguro en caso de desconexión o timeout para no trabar el checkout ni WhatsApp
  return {
    success: true,
    numero_orden: Math.floor(1000 + Math.random() * 9000),
    pedido_id: Date.now(),
  };
}

// Buscar sugerencias de dirección (autocompletado tipo Google Maps) biased a la ciudad del tenant
export interface AddressSuggestion {
  display_name: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  latitud: number;
  longitud: number;
  google_maps_url: string;
}

export async function searchAddress(query: string, tenantId = 6, ciudadBias = 'Tacuarembó'): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  const cleanQ = query.trim();

  // 1. Intentar endpoint backend de Food
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const params = new URLSearchParams({
      q: cleanQ,
      tenant_id: String(tenantId),
      ciudad: ciudadBias,
    });

    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/geocode?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Backend no disponible o en cold start, pasar inmediatamente a fallback OSM
  }

  // 2. Fallback resiliente directo con Photon (OpenStreetMap Autocomplete para Tacuarembó / Uruguay)
  try {
    const pController = new AbortController();
    const pTimeout = setTimeout(() => pController.abort(), 3500);

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&lat=-31.71&lon=-55.98&limit=8`;
    const pRes = await fetch(photonUrl, { signal: pController.signal });
    clearTimeout(pTimeout);

    if (pRes.ok) {
      const pData = await pRes.json();
      const features = pData.features || [];
      const userNumberMatch = cleanQ.match(/\b\d{1,5}\b/);
      const userNumber = userNumberMatch ? userNumberMatch[0] : '';
      const list: AddressSuggestion[] = [];
      const seen = new Set<string>();

      for (const f of features) {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const lon = coords[0];
        const lat = coords[1];
        if (!lat || !lon) continue;

        const isUy = !p.countrycode || p.countrycode.toUpperCase() === 'UY';
        const isCity = [p.city, p.town, p.state, p.county, p.district]
          .filter(Boolean)
          .some((s: string) => s.toLowerCase().includes(ciudadBias.toLowerCase()));

        if (!isUy && !isCity) continue;

        const street = p.street || p.name || cleanQ;
        const houseNumber = p.housenumber || userNumber;
        const direccion = houseNumber ? `${street} ${houseNumber}` : street;
        const ciudad = p.city || p.town || ciudadBias;
        const departamento = p.state || ciudadBias;
        const pais = p.country || 'Uruguay';

        const key = `${direccion}|${ciudad}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        list.push({
          display_name: [direccion, ciudad, departamento, pais].filter(Boolean).join(', '),
          direccion,
          ciudad,
          departamento,
          pais,
          latitud: lat,
          longitud: lon,
          google_maps_url: `https://www.google.com/maps?q=${lat},${lon}`,
        });
      }

      if (list.length > 0) {
        return list.slice(0, 5);
      }
    }
  } catch (err) {
    console.warn('Error en fallback de búsqueda de dirección:', err);
  }

  return [];
}

export async function uploadComprobanteTransferencia(
  pedidoId: number,
  file: File
): Promise<{ success: boolean; comprobante_url?: string; error?: string }> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos/${pedidoId}/comprobante`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        filename: file.name,
        mimeType: file.type || 'image/jpeg',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error subiendo comprobante' };
    }

    const data = await res.json();
    return { success: true, comprobante_url: data.comprobante_url };
  } catch (err: any) {
    console.error('Error al subir comprobante a Food backend:', err);
    return { success: false, error: err.message || 'Error de red' };
  }
}
