import { obtenerSesion } from "./auth";

const base = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? "";

/** Fila de documento del ERP (forma común a las vistas transaccionales). */
export interface Movimiento {
  idDocumento: number;
  tipoDoc: string;
  fechaEmision: string;
  nroSerieDoc: string;
  nomFormaVenta: string | null;
  nomEstado: string | null;
  esInverso: boolean;
  total: number;
  pagado: number;
  saldo: number;
  referencia: string | null;
}

export class PortalError extends Error {}

/** GET protegido: envía el token de la sesión en Authorization. */
async function getAuth<T>(path: string): Promise<T> {
  const sesion = obtenerSesion();
  if (!sesion) throw new PortalError("Tu sesión expiró. Inicia sesión de nuevo.");
  const res = await fetch(`${base}/api/portal/${path}`, {
    headers: { Authorization: `Bearer ${sesion.token}` },
  });
  if (res.status === 401 || res.status === 403)
    throw new PortalError("No tienes acceso o tu sesión expiró.");
  if (!res.ok) throw new PortalError(`Error ${res.status}. Intenta de nuevo.`);
  return res.json();
}

function conRango(path: string, desde?: string, hasta?: string): Promise<Movimiento[]> {
  const q = new URLSearchParams();
  if (desde) q.set("desde", desde);
  if (hasta) q.set("hasta", hasta);
  const qs = q.toString();
  return getAuth<Movimiento[]>(`${path}${qs ? `?${qs}` : ""}`);
}

export const obtenerMisCompras = (desde?: string, hasta?: string) =>
  conRango("mis-compras", desde, hasta);

export const obtenerEstadoCuenta = (desde?: string, hasta?: string) =>
  conRango("estado-cuenta", desde, hasta);

export const obtenerLiquidacionPagos = (desde?: string, hasta?: string) =>
  conRango("liquidacion-pagos", desde, hasta);
