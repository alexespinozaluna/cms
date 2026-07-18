import type { GrillaOfertasContenido, OfertaItem } from "@/lib/content-api";
import { formatearPrecio } from "@/lib/formato";
import { resolverMedia } from "@/lib/media";

function TarjetaOferta({ item, origen }: { item: OfertaItem; origen: "manual" | "erp" }) {
  // En origen 'erp' el precio vendrá del ERP (fase posterior); no se muestra precio manual.
  const conPrecio = origen === "manual" && item.precio !== undefined;

  return (
    <article className="group overflow-hidden rounded-[10px] border border-linea bg-white transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(71,93,45,0.15)]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#F2F4EC] to-[#E4E9DA] text-sm font-bold text-[#9AA88A]">
        {item.etiqueta && (
          <span className="titular absolute left-2.5 top-2.5 -rotate-2 rounded-sm bg-amarillo px-2.5 py-1 text-xs text-verde-osc">
            {item.etiqueta}
          </span>
        )}
        {item.imagen ? (
          /* Imágenes servidas por la API (fase 1: carpeta de archivos) */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolverMedia(item.imagen)}
            alt={item.producto ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          "Imagen del producto"
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold">{item.producto ?? item.codigo_producto}</h3>
        <div className="mt-1">
          {conPrecio ? (
            <span className="titular text-2xl text-rojo">{formatearPrecio(item.precio!)}</span>
          ) : (
            <span className="text-sm text-texto/60">Precio en tienda</span>
          )}
          {item.precio_antes !== undefined && (
            <span className="ml-2 text-sm text-texto/40 line-through">
              {formatearPrecio(item.precio_antes)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function GrillaOfertas({ contenido }: { contenido: GrillaOfertasContenido }) {
  return (
    <section id="ofertas" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="display mb-8 text-3xl text-verde-osc md:text-4xl">{contenido.titulo}</h2>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {contenido.items.map((item, i) => (
          <TarjetaOferta key={i} item={item} origen={contenido.origen} />
        ))}
      </div>
    </section>
  );
}
