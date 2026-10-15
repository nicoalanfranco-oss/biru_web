import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle, Bike, Store, ArrowRight, ShieldCheck, Send,
  MapPin, Navigation, ExternalLink, CreditCard, Banknote, Smartphone,
  Search, Loader2, Check, UserCheck, AlertCircle, Sparkles
} from 'lucide-react';
import { CartItem, MarcaInfo } from '../types/food';
import { sendOrderToFood } from '../services/api';

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

export function parseFlexibleDate(val: string): { iso: string; display: string } {
  if (!val) return { iso: '', display: '' };
  const clean = val.trim();
  let m = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mo = m[2].padStart(2, '0');
    const d = m[3].padStart(2, '0');
    return { iso: `${y}-${mo}-${d}`, display: `${d}/${mo}/${y}` };
  }
  m = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    let y = m[3];
    if (y.length === 2) {
      const yrNum = parseInt(y, 10);
      y = yrNum > 30 ? `19${y}` : `20${y}`;
    }
    return { iso: `${y}-${mo}-${d}`, display: `${d}/${mo}/${y}` };
  }
  m = clean.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) {
    const d = m[1];
    const mo = m[2];
    const y = m[3];
    return { iso: `${y}-${mo}-${d}`, display: `${d}/${mo}/${y}` };
  }
  m = clean.match(/^(\d{1,2})[-/.](\d{1,2})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    return { iso: `2000-${mo}-${d}`, display: `${d}/${mo}` };
  }
  return { iso: clean, display: clean };
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
  
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [pagaCon, setPagaCon] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
                  localStorage.setItem('biru_google_user', JSON.stringify(decoded));
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

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu navegador no soporta geolocalización.');
      return;
    }
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitud(lat);
        setLongitud(lng);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        setGoogleMapsUrl(url);
        if (!direccion) {
          setDireccion(`Ubicación GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }
        setBuscandoGps(false);
      },
      (err) => {
        console.warn('Error GPS:', err);
        setErrorMsg('No se pudo obtener tu ubicación precisa. Podés escribir tu dirección manualmente.');
        setBuscandoGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!telefono.trim() || telefono.trim().length < 8) {
      setErrorMsg('Ingresa un número de teléfono / WhatsApp válido.');
      return;
    }
    if (tipoEntrega === 'delivery' && !direccion.trim()) {
      setErrorMsg('Por favor ingresa tu dirección de entrega en Tacuarembó.');
      return;
    }

    try {
      setEnviando(true);

      const customerProfile = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        fecha_nacimiento: fechaNacimiento.trim(),
        direccion: direccion.trim(),
        apartamento: apartamento.trim(),
        google_maps_url: googleMapsUrl,
        latitud,
        longitud,
      };
      localStorage.setItem('biru_customer_profile', JSON.stringify(customerProfile));

      const payload = {
        tenant_id: 6,
        marca_id: 4,
        tipo_pedido: tipoEntrega,
        cliente_nombre: nombre.trim(),
        cliente_telefono: telefono.trim(),
        cliente_email: email.trim() || undefined,
        cliente_fecha_nacimiento: parseFlexibleDate(fechaNacimiento).iso || undefined,
        direccion_entrega: tipoEntrega === 'delivery' ? `${direccion.trim()}${apartamento.trim() ? ` (${apartamento.trim()})` : ''}` : undefined,
        google_maps_url: googleMapsUrl || undefined,
        latitud: latitud || undefined,
        longitud: longitud || undefined,
        metodo_pago: metodoPago,
        paga_con: metodoPago === 'efectivo' && pagaCon.trim() ? Number(pagaCon.trim()) : undefined,
        costo_delivery: costoEnvio,
        total: total,
        notas: notas.trim() || undefined,
        items: items.map(it => ({
          producto_id: it.producto_id,
          tipo: it.tipo,
          nombre: it.nombre,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          notas: it.notas || undefined,
          modificadores: it.modificadores || [],
        })),
      };

      const res = await sendOrderToFood(payload);
      const numOrden = res.numero_orden || Math.floor(1000 + Math.random() * 9000);

      // Líneas de items para WhatsApp
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
        ? `\n📍 *Dirección:* ${direccion.trim()}${apartamento.trim() ? ` (${apartamento.trim()})` : ''}${googleMapsUrl ? `\n🗺️ *Ubicación Maps:* ${googleMapsUrl}` : ''}`
        : '';

      const pagoTxt =
        metodoPago === 'efectivo'
          ? `Efectivo${pagaCon.trim() ? ` (Paga con $${pagaCon.trim()})` : ''}`
          : metodoPago === 'tarjeta'
          ? 'POS Tarjeta (Débito/Crédito)'
          : 'Transferencia Bancaria';

      const parsedBday = parseFlexibleDate(fechaNacimiento);
      const cumpleTxt = (parsedBday.display || fechaNacimiento.trim()) ? `\n🎂 *Cumpleaños:* ${parsedBday.display || fechaNacimiento.trim()}` : '';

      const textoWhatsApp = `*¡Hola Biru Bar & Delivery Tacuarembó!* 🍔🍻🍕
Acabo de realizar mi pedido desde la web oficial.

📋 *Pedido #B${numOrden}*
${canalTxt}${dirTxt}
👤 *Cliente:* ${nombre.trim()}
📱 *Teléfono:* ${telefono.trim()}
✉️ *Email:* ${email.trim()}${cumpleTxt}
💳 *Método de Pago:* ${pagoTxt}

🛍️ *Detalle del Pedido:*
${lineasItems}

💰 *TOTAL A PAGAR: $${total} UYU*${notas.trim() ? `\n\n💬 *Comentarios:* ${notas.trim()}` : ''}`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=59892033390&text=${encodeURIComponent(textoWhatsApp)}`;

      onOrderSuccess(numOrden, whatsappUrl, metodoPago, res.pedido_id);
    } catch (err: any) {
      console.error('Error enviando pedido:', err);
      setErrorMsg('Error de red al registrar el pedido. Probá nuevamente o contactanos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
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

        <form onSubmit={handleSubmit} className="checkout-modal-form">
          {errorMsg && (
            <div className="checkout-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

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
                    <span className="tab-sub">+$60 UYU</span>
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
                <label>Email (para aviso de estado)</label>
                <input
                  type="email"
                  placeholder="Ej: juan@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
              <div className="section-label-with-action">
                <label className="checkout-section-label">Dirección de Entrega en Tacuarembó *</label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={buscandoGps}
                  className="btn-gps-action"
                >
                  <Navigation size={13} />
                  <span>{buscandoGps ? 'Obteniendo GPS...' : 'Usar mi ubicación GPS'}</span>
                </button>
              </div>

              <div className="checkout-fields-grid">
                <div className="checkout-input-group full-width">
                  <input
                    type="text"
                    required
                    placeholder="Calle y número de puerta (Ej: 18 de Julio 240)"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    className="checkout-input"
                  />
                </div>

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

          {/* Botón de Enviar Pedido */}
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary checkout-submit-btn"
          >
            {enviando ? (
              <>
                <Loader2 size={18} className="spinner-spin" />
                <span>Enviando pedido a cocina...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Confirmar y Enviar Pedido (${total.toLocaleString()} UYU)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
