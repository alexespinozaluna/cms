import type { GrillaConcesionariosContenido } from "@/lib/content-api";
import { resolverMedia } from "@/lib/media";

export default function GrillaConcesionarios({
  contenido,
}: {
  contenido: GrillaConcesionariosContenido;
}) {
  return (
    <section className="border-y border-linea bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="titular border-b-4 border-dorado pb-2 text-3xl">{contenido.titulo}</h2>
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {contenido.items.map((c, i) => (
            <li key={i} className="flex flex-col items-center gap-2 text-center">
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolverMedia(c.logo)} alt={c.nombre} className="h-16 w-16 object-contain" />
              ) : (
                <span
                  aria-hidden
                  className="titular flex h-16 w-16 items-center justify-center rounded-full bg-papel text-2xl text-verde"
                >
                  {c.nombre.charAt(0)}
                </span>
              )}
              <span className="text-sm font-semibold">{c.nombre}</span>
              {c.rubro && <span className="text-xs text-texto/60">{c.rubro}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
