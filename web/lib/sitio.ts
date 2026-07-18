/**
 * Identidad del sitio: el código es genérico (CMS para retail); la marca
 * de la instancia (TuBazar u otra) viene SIEMPRE de variables de entorno.
 */
export const sitio = {
  /** Nombre corto de la marca (wordmark, títulos). */
  nombre: process.env.NEXT_PUBLIC_SITE_NAME ?? "Portal",
  /** Parte del nombre que se resalta en color en el wordmark (opcional). */
  acento: process.env.NEXT_PUBLIC_SITE_NAME_ACCENT ?? "",
  /** Nombre institucional / razón social (topbar, copyright). */
  slogan: process.env.NEXT_PUBLIC_SITE_SLOGAN ?? "",
  /** Descripción para SEO. */
  descripcion: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "",
};
