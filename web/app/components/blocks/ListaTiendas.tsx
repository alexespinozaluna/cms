import type { ListaTiendasContenido } from "@/lib/content-api";

export default function ListaTiendas({ contenido }: { contenido: ListaTiendasContenido }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="titular border-b-4 border-verde pb-2 text-3xl">{contenido.titulo}</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contenido.items.map((tienda, i) => (
          <li key={i} className="border border-linea bg-white p-5 shadow-sm">
            <h3 className="titular text-xl text-verde-osc">{tienda.nombre}</h3>
            <p className="mt-2 text-sm">{tienda.ubicacion}</p>
            {tienda.horario && <p className="mt-1 text-sm text-texto/70">{tienda.horario}</p>}
            {tienda.telefono && (
              <p className="mt-1 text-sm">
                <a href={`tel:${tienda.telefono}`} className="text-verde underline">
                  {tienda.telefono}
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
