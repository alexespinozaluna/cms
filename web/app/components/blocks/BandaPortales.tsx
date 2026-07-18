import Link from "next/link";
import type { BandaPortalesContenido } from "@/lib/content-api";

/** Banda institucional verde con las tarjetas de acceso a los portales. */
export default function BandaPortales({ contenido }: { contenido: BandaPortalesContenido }) {
  return (
    <section className="bg-verde text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
        {contenido.items.map((portal, i) => (
          <div key={i} className="flex flex-col bg-verde-osc p-6">
            <span className="titular text-sm text-amarillo">{portal.rol}</span>
            <h3 className="titular mt-1 text-2xl">{portal.titulo}</h3>
            {portal.beneficios && portal.beneficios.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-white/85">
                {portal.beneficios.map((b, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden className="text-amarillo">✓</span>
                    {b.texto}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={portal.url}
              className="titular mt-5 inline-block self-start bg-amarillo px-5 py-2 text-sm text-texto hover:bg-white"
            >
              {portal.texto_boton}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
