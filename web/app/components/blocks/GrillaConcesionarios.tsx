import type { GrillaConcesionariosContenido } from "@/lib/content-api";
import { resolverMedia } from "@/lib/media";

/** Iniciales para el logo de respaldo: se ignoran conectores ("Café del
    Patio" → "CP"); se toma la primera letra de las palabras propias. */
function iniciales(nombre: string): string {
  const propias = nombre.split(/\s+/).filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p));
  const base = propias.length > 0 ? propias : nombre.split(/\s+/);
  return base
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export default function GrillaConcesionarios({
  contenido,
}: {
  contenido: GrillaConcesionariosContenido;
}) {
  return (
    <section id="concesionarios" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="display mb-8 text-3xl text-verde-osc md:text-4xl">{contenido.titulo}</h2>
      <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {contenido.items.map((c, i) => (
          <li
            key={i}
            className="rounded-[10px] border border-linea bg-white p-6 text-center"
          >
            {c.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolverMedia(c.logo)}
                alt={c.nombre}
                className="mx-auto mb-3 h-14 w-14 rounded-full object-contain"
              />
            ) : (
              <span
                aria-hidden
                className="titular mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-verde text-lg text-amarillo"
              >
                {iniciales(c.nombre)}
              </span>
            )}
            <h3 className="display text-base text-verde-osc">{c.nombre}</h3>
            {c.rubro && <p className="mt-1 text-sm text-texto/60">{c.rubro}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
