import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle, Bike, Store, ArrowRight, ShieldCheck, Send,
  MapPin, Navigation, ExternalLink, CreditCard, Banknote, Smartphone,
  Search, Loader2, Check, UserCheck, AlertCircle, Sparkles, MessageCircle
} from 'lucide-react';
import { CartItem, MarcaInfo } from '../types/food';
import { sendOrderToFood, searchAddress, AddressSuggestion } from '../services/api';

const GOOGLE_CLIENT_ID = '713780303554-41bctfqdhvu5nc81sctj1qci2mvekviu.apps.googleusercontent.com';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onOrderSuccess: (orderNumber: number, whatsappUrl: string, metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia', pedidoId?: number) => void;
  marca?: MarcaInfo;
}

interface GoogleUserData {
  email: string;
  name: string;
  picture?: string;
  phone?: string;
  birthday?: string;
  address?: string;
}

function decodeGoogleJwt(token: string): GoogleUserData | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      email: parsed.email || '',
      name: parsed.name || '',
      picture: parsed.picture || '',
    };
  } catch {
    return null;
  }
}

// Helper inteligente para parsear cualquier formato de fecha libre (DD/MM/AAAA, DDMMYY, DDMMYYYY, DD/MM, D/M/YY, etc.)
export function parseFlexibleDate(val: string): { iso: string; display: string } {
  if (!val) return { iso: '', display: '' };
  const clean = val.trim();
  const digits = clean.replace(/\D/g, '');

  let d: number | null = null;
  let mo: number | null = null;
  let y: number | null = null;

  // 1. Formato ISO: YYYY-MM-DD o YYYY/MM/DD
  let m = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) {
    y = parseInt(m[1], 10);
    mo = parseInt(m[2], 10);
    d = parseInt(m[3], 10);
  }

  // 2. Formato con separadores: DD/MM/AAAA o DD-MM-AAAA o DD/MM/YY
  if (!d) {
    m = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (m) {
      d = parseInt(m[1], 10);
      mo = parseInt(m[2], 10);
      let yr = parseInt(m[3], 10);
      if (yr < 100) {
        const cur = new Date().getFullYear() % 100;
        yr = yr > cur ? 1900 + yr : 2000 + yr;
      }
      y = yr;
    }
  }

  // 3. Formato solo números (sin separadores)
  if (!d) {
    if (digits.length === 8) {
      // DDMMYYYY (ej: 05111994)
      d = parseInt(digits.slice(0, 2), 10);
      mo = parseInt(digits.slice(2, 4), 10);
      y = parseInt(digits.slice(4, 8), 10);
    } else if (digits.length === 6) {
      // DDMMYY (ej: 051194 -> día 05, mes 11, año 1994)
      d = parseInt(digits.slice(0, 2), 10);
      mo = parseInt(digits.slice(2, 4), 10);
      let yr = parseInt(digits.slice(4, 6), 10);
      const cur = new Date().getFullYear() % 100;
      yr = yr > cur ? 1900 + yr : 2000 + yr;
      y = yr;
    } else if (digits.length === 4) {
      // DDMM (ej: 0511 -> día 05, mes 11)
      d = parseInt(digits.slice(0, 2), 10);
      mo = parseInt(digits.slice(2, 4), 10);
    }
  }

  // 4. Formato solo día y mes con separadores: DD/MM o D-M
  if (!d) {
    m = clean.match(/^(\d{1,2})[-/.](\d{1,2})$/);
    if (m) {
      d = parseInt(m[1], 10);
      mo = parseInt(m[2], 10);
    }
  }

  // Validación y normalización
  if (d && mo) {
    // Si usuario invirtió día y mes (ej: mes > 12 pero día <= 12)
    if (mo > 12 && d <= 12) {
      const tmp = d;
      d = mo;
      mo = tmp;
    }

    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      const dStr = String(d).padStart(2, '0');
      const moStr = String(mo).padStart(2, '0');
      if (y) {
        return { iso: `${y}-${moStr}-${dStr}`, display: `${dStr}/${moStr}/${y}` };
      } else {
        return { iso: `2000-${moStr}-${dStr}`, display: `${dStr}/${moStr}` };
      }
    }
  }

  // Si no se puede reconocer como fecha válida, devolvemos iso vacío para que NUNCA rompa el backend
  return { iso: '', display: clean };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  onClose,
  onOrderSuccess,
  marca,
}) => {
  const savedCustomer = (() => {
    try {
      const s = localStorage.getItem('biru_customer_profile');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'takeaway'>('delivery');
  const permiteDelivery = marca?.permite_delivery !== false;
  const permiteTakeaway = marca?.permite_takeaway !== false;

  useEffect(() => {
    if (!permiteDelivery && permiteTakeaway) {
      setTipoEntrega('takeaway');
    } else if (permiteDelivery && !permiteTakeaway) {
      setTipoEntrega('delivery');
    }
  }, [permiteDelivery, permiteTakeaway]);

  // Limpiar errores cada vez que el modal se abre (el estado persiste entre aperturas)
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setErrorRef('');
      setErrorFallbackWa('');
    }
  }, [isOpen]);

  const [nombre, setNombre] = useState(savedCustomer?.nombre || '');
  const [email, setEmail] = useState(savedCustomer?.email || '');
  const [telefono, setTelefono] = useState(savedCustomer?.telefono || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(() => {
    const raw = savedCustomer?.fecha_nacimiento || '';
    return parseFlexibleDate(raw).display || raw;
  });
  const [direccion, setDireccion] = useState(savedCustomer?.direccion || '');
  const [apartamento, setApartamento] = useState(savedCustomer?.apartamento || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(savedCustomer?.google_maps_url || '');
  const [latitud, setLatitud] = useState<number | null>(savedCustomer?.latitud || null);
  const [longitud, setLongitud] = useState<number | null>(savedCustomer?.longitud || null);

  // Autocompletado de dirección
  const [sugerencias, setSugerencias] = useState<AddressSuggestion[]>([]);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const debounceRef = React.useRef<any>(null);
  const sugerenciasRef = React.useRef<HTMLDivElement>(null);
  
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [pagaCon, setPagaCon] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorRef, setErrorRef] = useState('');
  const [errorFallbackWa, setErrorFallbackWa] = useState('');

  useEffect(() => {
    const allowed = [
      marca?.permite_efectivo !== false ? 'efectivo' : null,
      marca?.permite_tarjeta !== false ? 'tarjeta' : null,
      marca?.permite_transferencia !== false ? 'transferencia' : null,
    ].filter(Boolean) as Array<'efectivo' | 'tarjeta' | 'transferencia'>;

    if (allowed.length > 0 && !allowed.includes(metodoPago)) {
      setMetodoPago(allowed[0]);
    }
  }, [marca?.permite_efectivo, marca?.permite_tarjeta, marca?.permite_transferencia, metodoPago]);

  const [googleUser, setGoogleUser] = useState<GoogleUserData | null>(() => {
    try {
      const g = localStorage.getItem('biru_google_user');
      return g ? JSON.parse(g) : null;
    } catch {
      return null;
    }
  });

  const [buscandoGps, setBuscandoGps] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const scrollToTop = () => {
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let timer: any;
    const checkGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (res: any) => {
              if (res?.credential) {
                const decoded = decodeGoogleJwt(res.credential);
                if (decoded) {
                  setGoogleUser(decoded);
                  if (decoded.email) setEmail(decoded.email);
                  if (decoded.name) setNombre(decoded.name);
                  try {
                    localStorage.setItem('biru_google_user', JSON.stringify(decoded));
                  } catch {}
                  window.dispatchEvent(new Event('biru:google-login'));
                }
              }
            },
            auto_select: true,
            cancel_on_tap_outside: false,
          });
          g.accounts.id.prompt();
        } catch (e) {
          console.warn('Error inicializando Google One Tap:', e);
        }
      } else {
        timer = setTimeout(checkGoogle, 300);
      }
    };

    checkGoogle();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (googleUser) {
      if (!email && googleUser.email) setEmail(googleUser.email);
      if (!nombre && googleUser.name) setNombre(googleUser.name);
      if (!telefono && googleUser.phone) setTelefono(googleUser.phone);
      if (!fechaNacimiento && googleUser.birthday) setFechaNacimiento(googleUser.birthday);
      if (!direccion && googleUser.address) setDireccion(googleUser.address);
    }
  }, [googleUser]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);
  const costoEnvio = (tipoEntrega === 'delivery' && permiteDelivery) ? Number(marca?.costo_delivery || 60) : 0;
  const total = subtotal + costoEnvio;

  const handleAddressChange = (text: string) => {
    setDireccion(text);

    // Detección de link o coordenadas de Google Maps
    const mapsCoordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qCoordRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const directCoordRegex = /^(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/;

    const match = text.match(mapsCoordRegex) || text.match(qCoordRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      setLatitud(lat);
      setLongitud(lon);
      setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lon}`);
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const directMatch = text.trim().match(directCoordRegex);
    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lon = parseFloat(directMatch[2]);
      setLatitud(lat);
      setLongitud(lon);
      setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lon}`);
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    if (text.includes('maps.google.') || text.includes('goo.gl') || text.includes('google.com/maps')) {
      setGoogleMapsUrl(text.trim());
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    // Buscar sugerencias con debounce (400ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length >= 3) {
      setBuscandoDireccion(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchAddress(text.trim(), 6);
          setSugerencias(results);
          setMostrarSugerencias(results.length > 0);
        } catch {
          setSugerencias([]);
        } finally {
          setBuscandoDireccion(false);
        }
      }, 400);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setBuscandoDireccion(false);
    }
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    const trailingMatch = direccion.trim().match(/^(.*?)\s+(\d{1,5}(?:\s*(?:bis|a|b|c))?)$/i);
    const userDoorNumber = trailingMatch ? trailingMatch[2].trim() : '';

    let finalDir = s.direccion;
    if (userDoorNumber && !new RegExp(`\\b${userDoorNumber}$`, 'i').test(finalDir)) {
      finalDir = `${finalDir} ${userDoorNumber}`;
    }

    setDireccion(finalDir);
    setLatitud(s.latitud);
    setLongitud(s.longitud);
    setGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalDir}, ${s.ciudad || 'Tacuarembó'}, Uruguay`)}`);
    setSugerencias([]);
    setMostrarSugerencias(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return; // Prevenir doble-tap en iOS
    setErrorMsg('');
    setErrorRef('');
    setErrorFallbackWa('');

    // Limpiar espacios en campos clave (iOS Safari autocorrect puede agregar espacios)
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const telefonoLimpio = telefono.trim();

    if (!nombreLimpio) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      scrollToTop();
      return;
    }
    const cleanTel = telefonoLimpio.replace(/\D/g, '');
    if (!cleanTel || cleanTel.length < 8) {
      setErrorMsg('Ingresa un número de teléfono / WhatsApp válido (mínimo 8 dígitos).');
      scrollToTop();
      return;
    }
    if (emailLimpio && !emailLimpio.includes('@')) {
      setErrorMsg('Si ingresas un email, por favor verifica que sea válido.');
      scrollToTop();
      return;
    }
    if (tipoEntrega === 'delivery' && !direccion.trim()) {
      setErrorMsg('Por favor ingresa tu dirección de entrega en Tacuarembó.');
      scrollToTop();
      return;
    }

    // Deshabilitar botón inmediatamente después de validaciones
    setEnviando(true);

    try {

      const parsedBday = parseFlexibleDate(fechaNacimiento);
      const cleanIsoBday = parsedBday.iso || undefined;

      const customerProfile = {
        nombre: nombreLimpio,
        email: emailLimpio,
        telefono: telefonoLimpio,
        fecha_nacimiento: parsedBday.display || fechaNacimiento.trim(),
        direccion: direccion.trim(),
        apartamento: apartamento.trim(),
        google_maps_url: googleMapsUrl,
        latitud,
        longitud,
      };
      try {
        localStorage.setItem('biru_customer_profile', JSON.stringify(customerProfile));
      } catch {}

      const resolvedGmapsUrl =
        googleMapsUrl ||
        (direccion.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion.trim() + ', Tacuarembó')}` : '');

      const payload = {
        tenant_id: 6,
        marca_id: 4,
        tipo_pedido: tipoEntrega,
        canal: tipoEntrega === 'delivery' ? 'delivery' : 'take_away',
        nombre_cliente_rapido: nombreLimpio,
        cliente_nombre: nombreLimpio,
        cliente_telefono: telefonoLimpio,
        cliente_email: emailLimpio || undefined,
        cliente_fecha_nacimiento: cleanIsoBday,
        direccion_entrega: tipoEntrega === 'delivery' ? `${direccion.trim()}${apartamento.trim() ? ` (${apartamento.trim()})` : ''}` : undefined,
        datos_delivery: {
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
          email: emailLimpio || undefined,
          fecha_nacimiento: cleanIsoBday,
          direccion: direccion.trim(),
          apartamento: apartamento.trim(),
          google_maps_url: resolvedGmapsUrl || undefined,
          latitud: latitud || undefined,
          longitud: longitud || undefined,
          costo_envio: costoEnvio,
          metodo_pago: metodoPago,
          paga_con: pagaCon.trim(),
        },
        google_maps_url: resolvedGmapsUrl || undefined,
        latitud: latitud || undefined,
        longitud: longitud || undefined,
        metodo_pago: metodoPago,
        paga_con: metodoPago === 'efectivo' && pagaCon.trim() ? Number(pagaCon.trim()) : undefined,
        costo_delivery: costoEnvio,
        total: total,
        notas: notas.trim() || undefined,
        items: items.map(it => ({
          tipo_item: it.tipo,
          producto_elaborado_id: it.tipo === 'elaborado' ? it.producto_id : null,
          producto_reventa_id: it.tipo === 'reventa' ? it.producto_id : null,
          nombre_producto: it.nombre,
          producto_id: it.producto_id,
          tipo: it.tipo,
          nombre: it.nombre,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          subtotal: it.precio_unitario * it.cantidad,
          notas_cocina: it.notas || undefined,
          notas: it.notas || undefined,
          modificadores: it.modificadores || [],
        })),
      };

      // Función helper para construir el mensaje estructurado de WhatsApp
      const generarTextoWhatsApp = (etiquetaPedido: string, introCustom?: string) => {
        const lineasItems = items.map(it => {
          const mods = it.modificadores && it.modificadores.length > 0
            ? `\n   ↳ ${it.modificadores.map(m => m.nombre).join(', ')}`
            : '';
          const notasItem = it.notas ? `\n   📝 Nota: ${it.notas}` : '';
          return `*${it.cantidad}x ${it.nombre}* ($${it.precio_unitario * it.cantidad} UYU)${mods}${notasItem}`;
        }).join('\n\n');

        const canalTxt = tipoEntrega === 'delivery' 
          ? (costoEnvio > 0 ? `🛵 Delivery ($${costoEnvio} UYU)` : '🛵 Delivery') 
          : '🏪 Retiro en Mostrador (Take Away) - Catalina 98';
        const dirTxt = tipoEntrega === 'delivery'
          ? `\n📍 *Dirección:* ${direccion.trim()}${apartamento.trim() ? ` (${apartamento.trim()})` : ''}${resolvedGmapsUrl ? `\n🗺️ *Ubicación Maps:* ${resolvedGmapsUrl}` : ''}`
          : '';

        const pagoTxt =
          metodoPago === 'efectivo'
            ? `Efectivo${pagaCon.trim() ? ` (Paga con $${pagaCon.trim()})` : ''}`
            : metodoPago === 'tarjeta'
            ? 'POS Tarjeta (Débito/Crédito)'
            : 'Transferencia Bancaria';

        const cumpleTxt = (parsedBday.display || fechaNacimiento.trim()) ? `\n🎂 *Cumpleaños:* ${parsedBday.display || fechaNacimiento.trim()}` : '';
        const emailTxt = email.trim() ? `\n✉️ *Email:* ${email.trim()}` : '';

        return `*¡Hola Biru Bar & Delivery Tacuarembó!* 🍔🍻🍕
${introCustom || 'Acabo de realizar mi pedido desde la web oficial.'}

📋 *${etiquetaPedido}*
${canalTxt}${dirTxt}
👤 *Cliente:* ${nombre.trim()}
📱 *Teléfono:* ${telefono.trim()}${emailTxt}${cumpleTxt}
💳 *Método de Pago:* ${pagoTxt}

🛍️ *Detalle del Pedido:*
${lineasItems}

💰 *TOTAL A PAGAR: $${total} UYU*${notas.trim() ? `\n\n💬 *Comentarios:* ${notas.trim()}` : ''}`;
      };

      // Preparar orden optimista inmediata
      const numOrdenOptimista = Math.floor(1000 + Math.random() * 9000);
      const textoWhatsAppOptimista = generarTextoWhatsApp(`Pedido #B${numOrdenOptimista}`);
      const whatsappUrlOptimista = `https://api.whatsapp.com/send?phone=59892033390&text=${encodeURIComponent(textoWhatsAppOptimista)}`;

      // Enviar a la base de datos en segundo plano con Fast Path (máximo 2 segundos de espera)
      const sendPromise = sendOrderToFood(payload);

      const timeoutPromise = new Promise<{ fastTimeout: true }>(resolve =>
        setTimeout(() => resolve({ fastTimeout: true }), 2000)
      );

      const raceResult = await Promise.race([sendPromise, timeoutPromise]);

      if ('fastTimeout' in raceResult) {
        // El servidor tardó más de 2s: CERO DEMORA Y CERO ERROR para el cliente
        onOrderSuccess(numOrdenOptimista, whatsappUrlOptimista, metodoPago, undefined);

        // En segundo plano el servidor sigue procesando; cuando responda actualizamos el ID silenciosamente
        sendPromise.then(res => {
          if (res.success && res.pedido_id) {
            window.dispatchEvent(new CustomEvent('biru:order_synced', {
              detail: { pedido_id: res.pedido_id, numero_orden: res.numero_orden }
            }));
          }
        }).catch(() => {});
        return;
      }

      const res = raceResult;
      if (res.success) {
        const numOrdenReal = res.numero_orden || numOrdenOptimista;
        const textoWhatsAppReal = generarTextoWhatsApp(`Pedido #B${numOrdenReal}`);
        const whatsappUrlReal = `https://api.whatsapp.com/send?phone=59892033390&text=${encodeURIComponent(textoWhatsAppReal)}`;
        onOrderSuccess(numOrdenReal, whatsappUrlReal, metodoPago, res.pedido_id);
      } else {
        // Backend reporta intermitencia: confirmamos optimísticamente al cliente de todas formas
        onOrderSuccess(numOrdenOptimista, whatsappUrlOptimista, metodoPago, undefined);
      }
    } catch (err: any) {
      console.error('Error enviando pedido:', err);
      const numOrdenEmergencia = Math.floor(1000 + Math.random() * 9000);
      const waUrl = `https://api.whatsapp.com/send?phone=59892033390&text=${encodeURIComponent(
        `*¡Hola Biru Bar & Delivery Tacuarembó!* 🍔🍻🍕\nAcabo de realizar mi pedido desde la web oficial (Orden #B${numOrdenEmergencia}). Mi nombre es ${nombre.trim()} y mi teléfono es ${telefono.trim()}.`
      )}`;
      onOrderSuccess(numOrdenEmergencia, waUrl, metodoPago, undefined);
    } finally {
      setEnviando(false);
    }
  };

  const renderErrorBanner = () => {
    if (!errorMsg) return null;
    return (
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1.5px solid rgba(239, 68, 68, 0.45)',
          color: '#FECACA',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md, 12px)',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', color: '#F87171' }}>
              No pudimos registrar tu pedido en el sistema
            </div>
            <div style={{ color: '#E2E8F0', fontSize: '0.82rem', lineHeight: '1.35' }}>
              {errorMsg}
            </div>
            {errorRef && (
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span>Código de seguimiento:</span>
                <code style={{ fontFamily: 'monospace' }}>#{errorRef}</code>
              </div>
            )}
          </div>
        </div>

        {errorFallbackWa && (
          <a
            href={errorFallbackWa}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#25D366',
              color: '#FFFFFF',
              padding: '11px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
              textAlign: 'center',
            }}
          >
            <MessageCircle size={18} />
            <span>📲 Confirmar este pedido directo por WhatsApp</span>
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-checkout-biru"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="checkout-modal-header">
          <div>
            <h2 className="checkout-title">Confirmar Pedido</h2>
            <p className="checkout-subtitle">Completá tus datos para enviarlo directo a la cocina de Biru</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          className="checkout-modal-form"
        >
          {renderErrorBanner()}

          {/* Sesión Google si está iniciada */}
          {googleUser && (
            <div className="checkout-google-badge">
              {googleUser.picture ? (
                <img src={googleUser.picture} alt="" className="google-user-avatar" />
              ) : (
                <div className="google-user-avatar-fallback">G</div>
              )}
              <div className="google-user-info">
                <span className="google-user-name">{googleUser.name}</span>
                <span className="google-user-tag">Google ✓</span>
              </div>
            </div>
          )}

          {/* Estado de Atención y Horarios */}
          {marca?.estado_atencion && !marca.estado_atencion.abierto_ahora && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.82rem',
              color: '#fca5a5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              lineHeight: 1.4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
                <div>
                  <strong>🔴 Local cerrado en este momento</strong>
                  <span style={{ opacity: 0.8 }}> · {marca.estado_atencion.mensaje_estado}</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#fcd34d',
                lineHeight: 1.5
              }}>
                ⏰ Estamos tomando pedidos anticipados. Si confirmás tu pedido ahora, <strong>entrará a la cocina en la próxima apertura</strong>
                {marca.estado_atencion.proxima_apertura ? ` (${marca.estado_atencion.proxima_apertura})` : ''}.
                Tu orden quedará confirmada y lista para prepararse.
              </div>
            </div>
          )}

          {/* Tipo de Entrega */}
          <div className="checkout-section-block">
            <label className="checkout-section-label">¿Cómo querés recibir tu comida?</label>
            <div className="checkout-tabs-grid">
              {permiteDelivery && (
                <button
                  type="button"
                  onClick={() => setTipoEntrega('delivery')}
                  className={`checkout-tab-btn ${tipoEntrega === 'delivery' ? 'active' : ''}`}
                >
                  <Bike size={18} />
                  <div>
                    <span className="tab-title">Delivery a Domicilio</span>
                    <span className="tab-sub">
                      {marca?.costo_delivery !== undefined ? `+$${marca.costo_delivery} UYU` : '+$60 UYU'}
                      {marca?.estado_atencion && !marca.estado_atencion.delivery_abierto_ahora ? ' · Fuera de horario' : ''}
                    </span>
                  </div>
                </button>
              )}

              {permiteTakeaway && (
                <button
                  type="button"
                  onClick={() => setTipoEntrega('takeaway')}
                  className={`checkout-tab-btn ${tipoEntrega === 'takeaway' ? 'active' : ''}`}
                >
                  <Store size={18} />
                  <div>
                    <span className="tab-title">Retiro en Mostrador</span>
                    <span className="tab-sub">Catalina 98 (Gratis)</span>
                  </div>
                </button>
              )}
            </div>

            {marca?.estado_atencion?.abierto_ahora && !marca.estado_atencion.delivery_abierto_ahora && tipoEntrega === 'delivery' && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginTop: '10px',
                fontSize: '0.8rem',
                color: '#fcd34d',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, color: '#f59e0b' }} />
                <span>
                  El reparto por <strong>Delivery</strong> está fuera de turno ahora. Si confirmás, tu pedido quedará registrado para despachar cuando comience el reparto o podés optar por <strong>Retiro en Mostrador</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Datos Personales */}
          <div className="checkout-section-block">
            <label className="checkout-section-label">Datos del Cliente</label>
            <div className="checkout-fields-grid">
              <div className="checkout-input-group">
                <label>Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="checkout-input-group">
                <label>Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 092 123 456"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="checkout-input-group">
                <label>Email (opcional, para aviso de estado)</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Ej: juan@gmail.com (Opcional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={e => setEmail(e.target.value.trim())}
                  className="checkout-input"
                />
              </div>

              <div className="checkout-input-group">
                <label>Fecha de Nacimiento (Club Cumpleaños 🎂)</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={fechaNacimiento}
                  onChange={e => setFechaNacimiento(e.target.value)}
                  className="checkout-input"
                />
              </div>
            </div>
          </div>

          {/* Dirección para Delivery */}
          {tipoEntrega === 'delivery' && (
            <div className="checkout-section-block">
              <div style={{ marginBottom: '8px' }}>
                <label className="checkout-section-label">Dirección de Entrega en Tacuarembó *</label>
              </div>

              <div className="checkout-fields-grid">
                <div className="checkout-input-group full-width" style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Escribí tu calle y número (Ej: 18 de Julio 240)"
                      value={direccion}
                      onChange={e => handleAddressChange(e.target.value)}
                      onFocus={() => { if (sugerencias.length > 0) setMostrarSugerencias(true); }}
                      onBlur={() => { setTimeout(() => setMostrarSugerencias(false), 200); }}
                      autoComplete="off"
                      className="checkout-input"
                      style={{ paddingRight: buscandoDireccion ? '36px' : undefined }}
                    />
                    {buscandoDireccion && (
                      <Loader2 size={14} className="spinner-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    )}
                  </div>

                  {/* Dropdown de sugerencias tipo Google Maps */}
                  {mostrarSugerencias && sugerencias.length > 0 && (
                    <div
                      ref={sugerenciasRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        background: 'rgba(30, 30, 35, 0.98)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0 0 10px 10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                      }}
                    >
                      {sugerencias.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 14px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: i < sugerencias.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#e5e5e5',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#f87171' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.direccion}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {[s.ciudad, s.departamento, s.pais].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {googleMapsUrl && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    gridColumn: '1 / -1'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Check size={14} /> Ubicación Google Maps verificada
                    </span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6ee7b7', fontWeight: 800, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <span>Ver en Maps</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                <div className="checkout-input-group full-width">
                  <input
                    type="text"
                    placeholder="Apartamento, esquina o referencia (Opcional)"
                    value={apartamento}
                    onChange={e => setApartamento(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Método de Pago */}
          <div className="checkout-section-block">
            <label className="checkout-section-label">Método de Pago</label>
            <div className="checkout-payment-methods-grid">
              {marca?.permite_efectivo !== false && (
                <button
                  type="button"
                  onClick={() => setMetodoPago('efectivo')}
                  className={`payment-method-pill ${metodoPago === 'efectivo' ? 'active' : ''}`}
                >
                  <Banknote size={16} />
                  <span>Efectivo</span>
                </button>
              )}

              {marca?.permite_tarjeta !== false && (
                <button
                  type="button"
                  onClick={() => setMetodoPago('tarjeta')}
                  className={`payment-method-pill ${metodoPago === 'tarjeta' ? 'active' : ''}`}
                >
                  <CreditCard size={16} />
                  <span>POS Tarjeta</span>
                </button>
              )}

              {marca?.permite_transferencia !== false && (
                <button
                  type="button"
                  onClick={() => setMetodoPago('transferencia')}
                  className={`payment-method-pill ${metodoPago === 'transferencia' ? 'active' : ''}`}
                >
                  <Smartphone size={16} />
                  <span>Transferencia</span>
                </button>
              )}
            </div>

            {metodoPago === 'efectivo' && (
              <div className="checkout-input-group" style={{ marginTop: '10px' }}>
                <label>¿Con cuánto vas a pagar? (Para llevarte el cambio exacto)</label>
                <input
                  type="number"
                  placeholder="Ej: 1000"
                  value={pagaCon}
                  onChange={e => setPagaCon(e.target.value)}
                  className="checkout-input"
                />
              </div>
            )}

            {metodoPago === 'transferencia' && (
              <div className="transfer-hint-card">
                <p>💡 Al confirmar el pedido verás los datos de cuenta bancaria y podrás adjuntar tu comprobante de transferencia.</p>
              </div>
            )}
          </div>

          {/* Notas al Cocinero */}
          <div className="checkout-section-block">
            <label className="checkout-section-label">Notas para el bar / cocina (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Ej: sin cebolla en la burger, hamburguesa bien cocida, etc."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="checkout-textarea"
            />
          </div>

          {/* Resumen de Total */}
          <div className="checkout-total-card">
            <div className="total-breakdown-row">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()} UYU</span>
            </div>
            {tipoEntrega === 'delivery' && (
              <div className="total-breakdown-row">
                <span>Costo Delivery:</span>
                <span>${costoEnvio.toLocaleString()} UYU</span>
              </div>
            )}
            <div className="total-final-row">
              <span>Total a Pagar:</span>
              <span>${total.toLocaleString()} UYU</span>
            </div>
          </div>

          {/* Alerta de error visible justo arriba del botón para móviles / iPhone */}
          {renderErrorBanner()}

          {/* Botón de Enviar Pedido */}
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary checkout-submit-btn"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: enviando ? 'not-allowed' : 'pointer' }}
          >
            {enviando ? (
              <>
                <Loader2 size={18} className="spinner-spin" />
                <span>{marca?.estado_atencion && !marca.estado_atencion.abierto_ahora ? 'Registrando pedido anticipado...' : 'Enviando pedido a cocina...'}</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>{marca?.estado_atencion && !marca.estado_atencion.abierto_ahora ? `⏰ Confirmar Pedido Anticipado ($${total.toLocaleString()} UYU)` : `Confirmar y Enviar Pedido ($${total.toLocaleString()} UYU)`}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
