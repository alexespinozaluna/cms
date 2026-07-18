import type { ListaTiendasContenido } from "@/lib/content-api";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="mt-2.5 flex gap-2 text-sm text-[#55554f]">
      <b className="min-w-[74px] font-bold text-verde-osc">{etiqueta}</b>
      <span>{children}</span>
    </div>
  );
}

export default function ListaTiendas({ contenido }: { contenido: ListaTiendasContenido }) {
  return (
    <section id="tiendas" className="border-y border-linea bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="display mb-8 text-3xl text-verde-osc md:text-4xl">{contenido.titulo}</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contenido.items.map((tienda, i) => (
            <li
              key={i}
              className="rounded-[10px] border border-linea border-l-4 border-l-verde bg-papel p-6"
            >
              <h3 className="display text-lg text-verde-osc">{tienda.nombre}</h3>
              <Dato etiqueta="Ubicación">{tienda.ubicacion}</Dato>
              {tienda.horario && <Dato etiqueta="Horario">{tienda.horario}</Dato>}
              {tienda.telefono && (
                <Dato etiqueta="Teléfono">
                  <a href={`tel:${tienda.telefono}`} className="text-verde underline">
                    {tienda.telefono}
                  </a>
                </Dato>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
