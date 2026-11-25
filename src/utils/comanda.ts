/**
 * Utilidades para formato de número de comanda / orden
 * 
 * Reglas de negocio:
 * 1. Para el tenant Nalú (tenant_id = 1 o nombre que contenga "nalu"):
 *    - Comandas de 3 dígitos (001 a 999).
 *    - Al llegar a 999, vuelve a 001.
 * 
 * 2. Para el resto de los tenants (Biru, Cookout, etc.):
 *    - Comandas de 1 letra y 2 dígitos (A01 a Z99).
 *    - 26 letras * 99 números = 2574 combinaciones posibles.
 *    - 1 a 99 -> A01 a A99
 *    - 100 a 198 -> B01 a B99
 *    - ... hasta 2574 -> Z99
 *    - Al superar Z99, reinicia en A01 (ciclo de 1 a 2574).
 */

export interface TenantLike {
  tenant_id?: number | string | null;
  nombre?: string | null;
}

export function isNaluTenant(tenant?: TenantLike | number | string | null, marcaNombre?: string | null): boolean {
  if (tenant == null) {
    if (marcaNombre) {
      const mNom = String(marcaNombre).toLowerCase();
      if (mNom.includes('nalu') || mNom.includes('nalú')) return true;
    }
    return false;
  }

  if (typeof tenant === 'number' || typeof tenant === 'string') {
    const tid = Number(tenant);
    if (tid === 1) return true;
  } else {
    if (Number(tenant.tenant_id) === 1) return true;
    const tNom = String(tenant.nombre || '').toLowerCase();
    if (tNom.includes('nalu') || tNom.includes('nalú')) return true;
  }

  if (marcaNombre) {
    const mNom = String(marcaNombre).toLowerCase();
    if (mNom.includes('nalu') || mNom.includes('nalú')) return true;
  }

  return false;
}

export function formatNumeroComanda(
  numeroOrden: number | string | null | undefined,
  tenant?: TenantLike | number | string | null,
  marcaNombre?: string | null
): string {
  const num = Number(numeroOrden || 0);
  if (!num || isNaN(num) || num <= 0) return '001';

  const nalu = isNaluTenant(tenant, marcaNombre);

  if (nalu) {
    // 3 dígitos: 1 -> 001, 999 -> 999. Ciclo cada 999
    const val = ((num - 1) % 999) + 1;
    return String(val).padStart(3, '0');
  }

  // 1 letra y 2 dígitos (A01 a Z99):
  const totalCiclo = 26 * 99; // 2574
  const idxCero = (num - 1) % totalCiclo; // 0 .. 2573
  const letterIndex = Math.floor(idxCero / 99); // 0 .. 25
  const letter = String.fromCharCode(65 + letterIndex); // 'A' .. 'Z'
  const subNum = (idxCero % 99) + 1; // 1 .. 99
  const numStr = String(subNum).padStart(2, '0');

  return `${letter}${numStr}`;
}
