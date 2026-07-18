import type { TextoRicoContenido } from "@/lib/content-api";

/**
 * Bloque de texto libre. El HTML lo producen solo editores autenticados del CMS;
 * aun así, cuando exista el panel admin la API deberá sanitizarlo al guardar.
 */
export default function TextoRico({ contenido }: { contenido: TextoRicoContenido }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div
        className="space-y-4 [&_a]:text-verde [&_a]:underline [&_h2]:titular [&_h2]:text-2xl [&_h3]:titular [&_h3]:text-xl [&_li]:ml-5 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: contenido.contenido }}
      />
    </section>
  );
}
