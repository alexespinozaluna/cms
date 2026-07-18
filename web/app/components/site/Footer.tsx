import Link from "next/link";
import type { MenuItem } from "@/lib/content-api";
import { sitio } from "@/lib/sitio";
import Logo from "./Logo";

/** Pie de página de 4 columnas (marca, explorar, portales, contacto) + barra legal. */
export default function Footer({ menu }: { menu: MenuItem[] }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-verde-osc text-[#C6D2B6]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Marca + descripción */}
        <div>
          <p className="display text-2xl text-white">
            <Logo variante="blanco" claseAcento="text-amarillo" className="h-8 w-auto" />
          </p>
          {(sitio.descripcion || sitio.slogan) && (
            <p className="mt-3 max-w-[34ch] text-sm">{sitio.descripcion || sitio.slogan}</p>
          )}
        </div>

        {/* Explorar: mismas secciones que el menú (data del CMS) */}
        <nav aria-label="Explorar">
          <h4 className="mb-3 text-sm font-bold text-white">Explorar</h4>
          {menu.map((item) => (
            <Link key={item.id} href={item.url} className="mt-2 block text-sm hover:text-amarillo">
              {item.etiqueta}
            </Link>
          ))}
        </nav>

        {/* Portales */}
        <nav aria-label="Portales">
          <h4 className="mb-3 text-sm font-bold text-white">Portales</h4>
          <Link href="/#portales" className="mt-2 block text-sm hover:text-amarillo">
            Clientes
          </Link>
          <Link href="/#portales" className="mt-2 block text-sm hover:text-amarillo">
            Proveedores
          </Link>
        </nav>

        {/* Contacto */}
        <nav aria-label="Contacto">
          <h4 className="mb-3 text-sm font-bold text-white">Contacto</h4>
          {sitio.facebook && (
            <a
              href={sitio.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm hover:text-amarillo"
            >
              Facebook
            </a>
          )}
          <Link href="/libro-de-reclamaciones" className="mt-2 block text-sm hover:text-amarillo">
            Libro de reclamaciones
          </Link>
          <Link href="/terminos-y-condiciones" className="mt-2 block text-sm hover:text-amarillo">
            Términos y condiciones
          </Link>
        </nav>
      </div>

      {/* Barra legal */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-xs sm:flex-row sm:justify-between">
          <span>
            © {anio} {sitio.slogan || sitio.nombre}. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
