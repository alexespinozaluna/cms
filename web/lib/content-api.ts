// Cliente tipado de la Content API pública (solo se usa en el servidor).
// Los tipos de contenido espejan tipos_bloque.esquema_campos del CMS.

const API_URL = process.env.CONTENT_API_URL ?? "http://localhost:5080";

/** Segundos de ISR para contenido público */
export const REVALIDATE_SEGUNDOS = 60;

// ---------- Tipos del contrato ----------

export interface MenuItem {
  id: number;
  etiqueta: string;
  url: string;
  tipo: "contenido" | "sistema";
  orden: number;
  hijos: MenuItem[];
}

export interface OfertaItem {
  codigo_producto?: string;
  producto?: string;
  precio?: number;
  precio_antes?: number;
  etiqueta?: string;
  imagen?: string;
}

export interface HeroCartelContenido {
  kicker?: string;
  titulo: string;
  /** Fragmento del título a resaltar en amarillo (opcional; debe estar en `titulo`). */
  titulo_resaltado?: string;
  subtitulo?: string;
  origen: "manual" | "erp";
  codigo_producto?: string;
  producto?: string;
  precio?: number;
  precio_antes?: number;
}

export interface GrillaOfertasContenido {
  titulo: string;
  origen: "manual" | "erp";
  items: OfertaItem[];
}

export interface ListaTiendasContenido {
  titulo: string;
  items: { nombre: string; ubicacion: string; horario?: string; telefono?: string }[];
}

export interface GrillaConcesionariosContenido {
  titulo: string;
  items: { nombre: string; rubro?: string; logo?: string }[];
}

export interface GrillaNoticiasContenido {
  titulo: string;
  items: { fecha: string; titulo: string; resumen?: string; imagen?: string; enlace?: string }[];
}

export interface BandaPortalesContenido {
  items: {
    rol: string;
    titulo: string;
    beneficios?: { texto: string }[];
    url: string;
    texto_boton: string;
  }[];
}

export interface TextoRicoContenido {
  contenido: string;
}

export interface FormularioCampo {
  nombre: string;
  etiqueta: string;
  tipo: "texto" | "textolargo" | "numero" | "fecha" | "opcion" | "correo";
  requerido: boolean;
  opciones?: string[];
}

export interface FormularioContenido {
  titulo?: string;
  destino_correo?: string;
  campos: FormularioCampo[];
}

interface BloqueBase<T extends string, C> {
  id: number;
  tipo: T;
  orden: number;
  contenido: C;
}

export type Bloque =
  | BloqueBase<"hero_cartel", HeroCartelContenido>
  | BloqueBase<"grilla_ofertas", GrillaOfertasContenido>
  | BloqueBase<"lista_tiendas", ListaTiendasContenido>
  | BloqueBase<"grilla_concesionarios", GrillaConcesionariosContenido>
  | BloqueBase<"grilla_noticias", GrillaNoticiasContenido>
  | BloqueBase<"banda_portales", BandaPortalesContenido>
  | BloqueBase<"texto_rico", TextoRicoContenido>
  | BloqueBase<"formulario", FormularioContenido>;

export interface PaginaDetalle {
  slug: string;
  titulo: string;
  descripcionSeo: string | null;
  plantilla: string;
  bloques: Bloque[];
}

// ---------- Fetchers ----------

/**
 * Página publicada y vigente por slug; null si no existe (→ notFound).
 * Resiliente: si la Content API no responde (p. ej. durante el build o una
 * caída puntual) devuelve null y la página cae a su fallback en vez de romper.
 */
export async function obtenerPagina(slug: string): Promise<PaginaDetalle | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/contenido/paginas/${encodeURIComponent(slug)}`,
      { next: { revalidate: REVALIDATE_SEGUNDOS } },
    );
    if (!res.ok) return null; // 404 u otro estado: se trata como "no disponible"
    return res.json();
  } catch {
    return null;
  }
}

/** Árbol de menú público; nunca rompe el layout: ante error devuelve vacío. */
export async function obtenerMenu(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/contenido/menu`, {
      next: { revalidate: REVALIDATE_SEGUNDOS },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** URL pública del endpoint de respuestas de formulario (la usa el cliente). */
export function urlRespuestasFormulario(bloqueId: number): string {
  const base = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? "http://localhost:5080";
  return `${base}/api/contenido/formularios/${bloqueId}/respuestas`;
}
