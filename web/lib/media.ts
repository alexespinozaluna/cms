const base = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? "";

/**
 * Resuelve una ruta de media del CMS contra la URL de la Content API.
 * El contenido guarda rutas relativas ("/media/ofertas/arroz.jpg") para no
 * acoplar la data al ambiente; las URLs absolutas se respetan tal cual.
 */
export function resolverMedia(url: string): string {
  return url.startsWith("/") ? `${base}${url}` : url;
}
