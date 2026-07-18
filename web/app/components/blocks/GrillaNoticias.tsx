import Link from "next/link";
import type { GrillaNoticiasContenido } from "@/lib/content-api";
import { formatearFecha } from "@/lib/formato";
import { resolverMedia } from "@/lib/media";

export default function GrillaNoticias({ contenido }: { contenido: GrillaNoticiasContenido }) {
  return (
    <section id="noticias" className="border-y border-linea bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="display mb-8 text-3xl text-verde-osc md:text-4xl">{contenido.titulo}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contenido.items.map((noticia, i) => {
            const cuerpo = (
              <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-linea bg-white">
                {noticia.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolverMedia(noticia.imagen)}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#F6EFE0] to-[#EADFC4] text-sm font-bold text-[#B7A47C]"
                  >
                    Imagen de la noticia
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <time className="titular text-xs tracking-[0.08em] text-rojo">
                    {formatearFecha(noticia.fecha)}
                  </time>
                  <h3 className="display mt-1.5 text-lg leading-snug text-verde-osc">
                    {noticia.titulo}
                  </h3>
                  {noticia.resumen && (
                    <p className="mt-2 text-sm text-[#55554f]">{noticia.resumen}</p>
                  )}
                </div>
              </article>
            );
            return noticia.enlace ? (
              <Link key={i} href={noticia.enlace} className="block h-full">
                {cuerpo}
              </Link>
            ) : (
              <div key={i}>{cuerpo}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
