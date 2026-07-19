import { obtenerSesion } from "./auth";

const base = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? "";

export interface PaginaAdmin {
  id: number;
  slug: string;
  titulo: string;
  descripcionSeo: string | null;
  plantilla: string;
  estado: string;
  vigenciaDesde: string | null;
  vigenciaHasta: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PaginaGuardar {
  slug: string;
  titulo: string;
  descripcionSeo?: string | null;
  plantilla: string;
  estado: string;
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
}

export class AdminError extends Error {}

async function req<T>(path: string, method: string, body?: unknown): Promise<T> {
  const sesion = obtenerSesion();
  if (!sesion) throw new AdminError("Tu sesión expiró. Inicia sesión de nuevo.");
  const res = await fetch(`${base}/api/admin/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${sesion.token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new AdminError(mensajeDeError(res, data));
  return data as T;
}

function mensajeDeError(res: Response, data: unknown): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.error === "string") return d.error;
    if (d.errors && typeof d.errors === "object") {
      const primero = Object.values(d.errors as Record<string, string[]>)[0];
      if (Array.isArray(primero) && typeof primero[0] === "string") return primero[0];
    }
  }
  return `Error ${res.status}. Intenta de nuevo.`;
}

// ---------- Bloques (metadata-driven) ----------

export type ValorCampo =
  | string
  | number
  | boolean
  | null
  | undefined
  | ValorCampo[]
  | { [k: string]: ValorCampo };

export interface CampoEsquema {
  nombre: string;
  tipo: string; // texto | textolargo | opcion | decimal | imagen | fecha | lista
  etiqueta: string;
  requerido?: boolean;
  opciones?: string[];
  campos?: CampoEsquema[]; // para tipo 'lista'
}

export interface TipoBloque {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  esquemaCampos: CampoEsquema[];
}

export interface Bloque {
  id: number;
  paginaId: number;
  tipoBloqueId: number;
  tipoCodigo: string;
  tipoNombre: string;
  orden: number;
  estado: string;
  vigenciaDesde: string | null;
  vigenciaHasta: string | null;
  contenido: Record<string, ValorCampo>;
}

export const listarTipos = () => req<TipoBloque[]>("tipos-bloque", "GET");
export const listarBloques = (paginaId: number) => req<Bloque[]>(`paginas/${paginaId}/bloques`, "GET");
export const crearBloque = (paginaId: number, tipoBloqueId: number, contenido: unknown, estado: string) =>
  req<{ id: number }>(`paginas/${paginaId}/bloques`, "POST", { tipoBloqueId, contenido, estado });
export const actualizarBloque = (id: number, contenido: unknown, estado: string) =>
  req<void>(`bloques/${id}`, "PUT", { contenido, estado });
export const reordenarBloques = (paginaId: number, ids: number[]) =>
  req<void>(`paginas/${paginaId}/bloques/orden`, "PUT", { ids });
export const eliminarBloque = (id: number) => req<void>(`bloques/${id}`, "DELETE");

// ---------- Menú ----------

export interface MenuItem {
  id: number;
  padreId: number | null;
  etiqueta: string;
  url: string;
  tipo: string; // contenido | sistema
  orden: number;
  estado: string;
  vigenciaDesde: string | null;
  vigenciaHasta: string | null;
}

export interface MenuGuardar {
  padreId?: number | null;
  etiqueta: string;
  url: string;
  tipo: string;
  estado: string;
}

export const listarMenu = () => req<MenuItem[]>("menu", "GET");
export const crearMenu = (m: MenuGuardar) => req<{ id: number }>("menu", "POST", m);
export const actualizarMenu = (id: number, m: MenuGuardar) => req<void>(`menu/${id}`, "PUT", m);
export const reordenarMenu = (ids: number[]) => req<void>("menu/orden", "PUT", { ids });
export const eliminarMenu = (id: number) => req<void>(`menu/${id}`, "DELETE");

export const listarPaginas = () => req<PaginaAdmin[]>("paginas", "GET");
export const obtenerPagina = (id: number) => req<PaginaAdmin>(`paginas/${id}`, "GET");
export const crearPagina = (p: PaginaGuardar) => req<{ id: number }>("paginas", "POST", p);
export const actualizarPagina = (id: number, p: PaginaGuardar) =>
  req<void>(`paginas/${id}`, "PUT", p);
export const cambiarEstadoPagina = (id: number, estado: string) =>
  req<void>(`paginas/${id}/estado`, "PATCH", { estado });
export const eliminarPagina = (id: number) => req<void>(`paginas/${id}`, "DELETE");
