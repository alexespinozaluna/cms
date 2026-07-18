import Link from "next/link";
import type { GrillaNoticiasContenido } from "@/lib/content-api";
import { formatearFecha } from "@/lib/formato";
import { resolverMedia } from "@/lib/media";

export default function GrillaNoticias({ contenido }: { contenido: GrillaNoticiasContenido }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="titular border-b-4 border-verde pb-2 text-3xl">{contenido.titulo}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contenido.items.map((noticia, i) => {
          const cuerpo = (
            <article className="flex h-full flex-col border border-linea bg-white shadow-sm">
              {noticia.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolverMedia(noticia.imagen)} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <div aria-hidden className="aspect-video w-full bg-verde/10" />
              )}
              <div className="flex flex-1 flex-col p-5">
                <time className="text-xs font-semibold text-dorado uppercase">
                  {formatearFecha(noticia.fecha)}
                </time>
                <h3 className="titular mt-1 text-xl leading-tight">{noticia.titulo}</h3>
                {noticia.resumen && (
                  <p className="mt-2 text-sm text-texto/80">{noticia.resumen}</p>
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
    </section>
  );
}
