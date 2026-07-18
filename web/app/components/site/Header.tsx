import Link from "next/link";
import type { MenuItem } from "@/lib/content-api";
import { sitio } from "@/lib/sitio";
import Marca from "./Marca";

function ItemNav({ item }: { item: MenuItem }) {
  if (item.hijos.length === 0) {
    return (
      <Link
        href={item.url}
        className="rounded-md px-3.5 py-2 text-sm font-semibold text-verde-osc hover:bg-papel"
      >
        {item.etiqueta}
      </Link>
    );
  }
  // Submenú accesible sin JS: details/summary estilizado
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none rounded-md px-3.5 py-2 text-sm font-semibold text-verde-osc hover:bg-papel">
        {item.etiqueta} <span aria-hidden>▾</span>
      </summary>
      <ul className="absolute left-0 z-20 min-w-44 border border-linea bg-white shadow-lg">
        {item.hijos.map((hijo) => (
          <li key={hijo.id}>
            <Link
              href={hijo.url}
              className="block px-4 py-2 text-sm hover:bg-papel hover:text-rojo"
            >
              {hijo.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Cabecera fija: topbar institucional verde + logo + menú (data del CMS). */
export default function Header({ menu }: { menu: MenuItem[] }) {
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Topbar: slogan institucional + accesos rápidos a los portales */}
      <div className="bg-verde text-[#DDE6D2]">
        <div className="mx-auto flex min-h-[34px] max-w-6xl items-center justify-between gap-4 px-5 text-xs">
          <span>{sitio.slogan}</span>
          <nav className="flex gap-4" aria-label="Accesos de portal">
            <Link href="/#portales" className="font-bold text-amarillo">
              Portal cliente
            </Link>
            <Link href="/#portales" className="font-bold text-amarillo">
              Portal proveedor
            </Link>
          </nav>
        </div>
      </div>

      {/* Barra principal: logo + menú de secciones + acciones */}
      <div className="border-b border-linea">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center gap-6 px-5">
          <Link href="/" aria-label={`${sitio.nombre} — inicio`} className="display text-2xl text-rojo">
            <Marca claseAcento="text-dorado" />
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1" aria-label="Menú principal">
            {menu.map((item) => (
              <ItemNav key={item.id} item={item} />
            ))}
          </nav>
          <div className="hidden items-center gap-2.5 sm:flex">
            <Link
              href="/#portales"
              className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/#ofertas"
              className="rounded-lg border-2 border-rojo bg-rojo px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              Ver ofertas
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
