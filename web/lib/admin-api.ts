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

export const listarPaginas = () => req<PaginaAdmin[]>("paginas", "GET");
export const obtenerPagina = (id: number) => req<PaginaAdmin>(`paginas/${id}`, "GET");
export const crearPagina = (p: PaginaGuardar) => req<{ id: number }>("paginas", "POST", p);
export const actualizarPagina = (id: number, p: PaginaGuardar) =>
  req<void>(`paginas/${id}`, "PUT", p);
export const cambiarEstadoPagina = (id: number, estado: string) =>
  req<void>(`paginas/${id}/estado`, "PATCH", { estado });
export const eliminarPagina = (id: number) => req<void>(`paginas/${id}`, "DELETE");
