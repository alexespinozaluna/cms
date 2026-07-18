/** Formatea precios en soles: 18.9 → "S/ 18.90" */
export function formatearPrecio(valor: number): string {
  return `S/ ${valor.toFixed(2)}`;
}

/** Fecha ISO → "17 jul 2026" (es-PE) */
export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}
