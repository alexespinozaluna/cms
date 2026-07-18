import type { HeroCartelContenido } from "@/lib/content-api";
import { formatearPrecio } from "@/lib/formato";

/** Hero rojo con el cartel de precio de góndola (firma visual del diseño). */
export default function HeroCartel({ contenido }: { contenido: HeroCartelContenido }) {
  const { kicker, titulo, subtitulo, origen, producto, precio, precio_antes } = contenido;
  // En origen 'erp' el precio se resolverá contra la API del ERP (fase posterior);
  // mientras tanto no se inventa precio: solo se muestra el editorial.
  const mostrarCartel = origen === "manual" && producto && precio !== undefined;

  return (
    <section className="bg-rojo text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-14 md:flex-row md:justify-between md:py-20">
        <div className="max-w-xl text-center md:text-left">
          {kicker && (
            <span className="titular inline-block bg-amarillo px-3 py-1 text-sm text-texto">
              {kicker}
            </span>
          )}
          <h1 className="titular mt-4 text-4xl leading-none md:text-6xl">{titulo}</h1>
          {subtitulo && <p className="mt-4 text-lg text-white/90">{subtitulo}</p>}
        </div>

        {mostrarCartel && (
          <div className="cartel relative w-64 bg-white p-6 text-texto shadow-2xl">
            <span className="titular absolute -top-4 -right-4 rotate-6 bg-amarillo px-3 py-2 text-sm shadow">
              Oferta
            </span>
            <p className="titular text-xl">{producto}</p>
            {precio_antes !== undefined && (
              <p className="mt-2 text-sm text-texto/60 line-through">
                {formatearPrecio(precio_antes)}
              </p>
            )}
            <p className="titular text-5xl text-rojo">{formatearPrecio(precio)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
