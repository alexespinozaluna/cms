import type { GrillaOfertasContenido, OfertaItem } from "@/lib/content-api";
import { formatearPrecio } from "@/lib/formato";

function TarjetaOferta({ item, origen }: { item: OfertaItem; origen: "manual" | "erp" }) {
  // En origen 'erp' el precio vendrá del ERP (fase posterior); no se muestra precio manual.
  const conPrecio = origen === "manual" && item.precio !== undefined;

  return (
    <article className="cartel relative flex flex-col border border-linea bg-white p-4 shadow-md">
      {item.etiqueta && (
        <span className="titular absolute -top-3 -right-3 rotate-6 bg-amarillo px-2 py-1 text-xs shadow">
          {item.etiqueta}
        </span>
      )}
      {item.imagen ? (
        /* Imágenes servidas por la API (fase 1: carpeta de archivos) */
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imagen} alt={item.producto ?? ""} className="mb-3 aspect-square w-full object-cover" />
      ) : (
        <div aria-hidden className="mb-3 aspect-square w-full bg-papel" />
      )}
      <h3 className="titular text-lg leading-tight">{item.producto ?? item.codigo_producto}</h3>
      <div className="mt-auto pt-2">
        {item.precio_antes !== undefined && (
          <span className="mr-2 text-sm text-texto/60 line-through">
            {formatearPrecio(item.precio_antes)}
          </span>
        )}
        {conPrecio ? (
          <span className="titular text-3xl text-rojo">{formatearPrecio(item.precio!)}</span>
        ) : (
          <span className="text-sm text-texto/60">Precio en tienda</span>
        )}
      </div>
    </article>
  );
}

export default function GrillaOfertas({ contenido }: { contenido: GrillaOfertasContenido }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="titular border-b-4 border-rojo pb-2 text-3xl">{contenido.titulo}</h2>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {contenido.items.map((item, i) => (
          <TarjetaOferta key={i} item={item} origen={contenido.origen} />
        ))}
      </div>
    </section>
  );
}
