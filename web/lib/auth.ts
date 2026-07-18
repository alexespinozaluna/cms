import { z } from "zod";

const base = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? "";

/** Tipo de documento (coincide con @Tipo del SP). */
export const TIPO_DNI = 1;
export const TIPO_CIP = 2;

// ---------- Esquemas (espejo de la validación del backend) ----------

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[a-z]/, "Debe incluir una minúscula.")
  .regex(/[A-Z]/, "Debe incluir una mayúscula.")
  .regex(/\d/, "Debe incluir un número.");

const documento = z.string().regex(/^\d{8,9}$/, "El documento debe tener 8 o 9 dígitos.");

export const registroSchema = z.object({
  // valor del <select> (string); se convierte a número al llamar la API
  tipo: z.enum([String(TIPO_DNI), String(TIPO_CIP)]),
  documento,
  correo: z.string().email("Correo inválido."),
  telefono: z.string().max(20).optional().or(z.literal("")),
  password,
});

export const loginSchema = z.object({
  usuario: documento,
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface Verificacion {
  nombre: string;
  roles: string[];
}

export interface Sesion {
  token: string;
  expira: string;
  usuario: string;
  nombre: string;
  roles: string[];
}

export class AuthError extends Error {}

// ---------- Llamadas a la API ----------

function mensajeDeError(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.error === "string") return d.error;
  if (Array.isArray(d.errores)) return d.errores.join(" ");
  if (d.errors && typeof d.errors === "object") {
    const primero = Object.values(d.errors as Record<string, string[]>)[0];
    if (Array.isArray(primero)) return primero[0];
  }
  return null;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AuthError(mensajeDeError(data) ?? `Error ${res.status}. Intenta de nuevo.`);
  }
  return data as T;
}

/** Paso previo al registro: valida existencia en ERP + no registrado; trae el nombre. */
export function verificarDocumento(documento: string, tipo: number) {
  return postJson<Verificacion>("verificar-documento", { documento, tipo });
}

export interface RegistroPayload {
  documento: string;
  tipo: number;
  correo: string;
  telefono?: string;
  password: string;
  nombreCompleto?: string;
}

export function registrar(input: RegistroPayload) {
  return postJson<Sesion>("registro", input);
}

export function login(input: LoginInput) {
  return postJson<Sesion>("login", input);
}

// ---------- Sesión en el navegador ----------

const CLAVE = "tb_sesion";

export function guardarSesion(sesion: Sesion) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
  const expira = new Date(sesion.expira).toUTCString();
  document.cookie = `${CLAVE}=1; path=/; expires=${expira}; SameSite=Lax`;
}

export function obtenerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CLAVE);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Sesion;
    if (new Date(s.expira).getTime() < Date.now()) {
      cerrarSesion();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLAVE);
  document.cookie = `${CLAVE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
