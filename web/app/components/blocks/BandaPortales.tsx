import Link from "next/link";
import type { BandaPortalesContenido } from "@/lib/content-api";

/** Banda institucional verde con las tarjetas de acceso a los portales. */
export default function BandaPortales({ contenido }: { contenido: BandaPortalesContenido }) {
  return (
    <section id="portales" className="bg-verde text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
        {contenido.items.map((portal, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/15 bg-white/[0.06] p-8"
          >
            <span className="titular inline-block rounded-sm bg-amarillo px-2.5 py-1 text-xs tracking-[0.1em] text-verde-osc">
              {portal.rol}
            </span>
            <h3 className="display mt-3.5 text-2xl">{portal.titulo}</h3>
            {portal.beneficios && portal.beneficios.length > 0 && (
              <ul className="mt-3.5 list-disc space-y-1.5 pl-5 text-sm text-[#DCE5D0] marker:text-amarillo">
                {portal.beneficios.map((b, j) => (
                  <li key={j}>{b.texto}</li>
                ))}
              </ul>
            )}
            <Link
              href={portal.url}
              className="mt-5 inline-block rounded-lg border-2 border-white px-5 py-2.5 text-sm font-bold transition hover:bg-white hover:text-verde"
            >
              {portal.texto_boton}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
