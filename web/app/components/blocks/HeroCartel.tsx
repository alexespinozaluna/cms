import type { HeroCartelContenido } from "@/lib/content-api";
import { formatearPrecio } from "@/lib/formato";

/** Hero rojo con el cartel de precio de góndola (firma visual del diseño). */
export default function HeroCartel({ contenido }: { contenido: HeroCartelContenido }) {
  const { kicker, titulo, subtitulo, origen, producto, precio, precio_antes } = contenido;
  // En origen 'erp' el precio se resolverá contra la API del ERP (fase posterior);
  // mientras tanto no se inventa precio: solo se muestra el editorial.
  const mostrarCartel = origen === "manual" && producto && precio !== undefined;

  // Precio partido para el formato de cartel: entero grande + "S/" y centavos en volado.
  const entero = precio !== undefined ? Math.floor(precio) : 0;
  const centavos =
    precio !== undefined ? Math.round((precio - entero) * 100).toString().padStart(2, "0") : "00";

  return (
    <section className="relative overflow-hidden bg-rojo text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.2fr_.8fr] md:py-16">
        <div>
          {kicker && (
            <span className="titular inline-block -rotate-1 rounded-sm bg-amarillo px-3 py-1.5 text-xs tracking-[0.12em] text-verde-osc">
              {kicker}
            </span>
          )}
          <h1 className="display mt-4 text-4xl text-white md:text-6xl">{titulo}</h1>
          {subtitulo && <p className="mt-4 max-w-[46ch] text-lg text-white/85">{subtitulo}</p>}
        </div>

        {mostrarCartel && (
          <div className="cartel relative w-full max-w-[340px] justify-self-start rounded-[10px] bg-white px-7 pb-5 pt-7 text-texto shadow-[0_18px_40px_rgba(0,0,0,0.30)] md:justify-self-end">
            <span className="titular absolute -left-3 -top-3 -rotate-6 rounded bg-verde px-3.5 py-2 text-xs tracking-[0.1em] text-amarillo">
              Oferta
            </span>
            <p className="text-base font-bold text-verde-osc">{producto}</p>
            <p className="titular my-1 leading-none text-rojo">
              <sup className="text-2xl">S/</sup>
              <span className="text-7xl">{entero}</span>
              <sup className="text-2xl">.{centavos}</sup>
            </p>
            {precio_antes !== undefined && (
              <p className="text-sm text-[#8a8a83] line-through">Antes {formatearPrecio(precio_antes)}</p>
            )}
          </div>
        )}
      </div>

      {/* Franja amarilla de "cartel de precio" al pie del hero */}
      <div
        aria-hidden
        className="h-2.5 w-full"
        style={{
          background: "repeating-linear-gradient(90deg,#FFEB04 0 28px,transparent 28px 56px)",
        }}
      />
    </section>
  );
}
