import Link from "next/link";
import type { MenuItem } from "@/lib/content-api";
import { sitio } from "@/lib/sitio";
import Marca from "./Marca";

function ItemNav({ item }: { item: MenuItem }) {
  if (item.hijos.length === 0) {
    return (
      <Link href={item.url} className="titular px-3 py-2 text-sm hover:text-rojo">
        {item.etiqueta}
      </Link>
    );
  }
  // Submenú accesible sin JS: details/summary estilizado
  return (
    <details className="group relative">
      <summary className="titular cursor-pointer list-none px-3 py-2 text-sm hover:text-rojo">
        {item.etiqueta} <span aria-hidden>▾</span>
      </summary>
      <ul className="absolute left-0 z-20 min-w-44 border border-linea bg-white shadow-lg">
        {item.hijos.map((hijo) => (
          <li key={hijo.id}>
            <Link href={hijo.url} className="block px-4 py-2 text-sm hover:bg-papel hover:text-rojo">
              {hijo.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Cabecera: topbar institucional verde + logo + menú (data del CMS). */
export default function Header({ menu }: { menu: MenuItem[] }) {
  return (
    <header>
      <div className="bg-verde-osc px-4 py-1.5 text-center text-xs text-white">
        {sitio.slogan}
      </div>
      <div className="border-b-4 border-rojo bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="titular text-3xl leading-none">
            <Marca claseAcento="text-rojo" />
          </Link>
          <nav aria-label="Menú principal" className="flex flex-wrap items-center">
            {menu.map((item) => (
              <ItemNav key={item.id} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
