"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerSesion, cerrarSesion, type Sesion } from "@/lib/auth";

const ROLES_ADMIN = ["Editor", "Admin"];

/**
 * Shell del panel /admin. Guarda por rol y chrome propio. Se monta como overlay
 * de pantalla completa (por encima del header público del layout raíz).
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      router.replace("/login?next=/admin");
      return;
    }
    if (!s.roles.some((r) => ROLES_ADMIN.includes(r))) {
      router.replace("/");
      return;
    }
    setSesion(s);
    setListo(true);
  }, [router]);

  if (!listo || !sesion) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-auto bg-papel">
      <header className="bg-verde-osc text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/admin" className="display text-lg">
            Panel CMS
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-amarillo">
              Ver sitio
            </Link>
            <span className="hidden text-white/70 sm:inline">{sesion.nombre || sesion.usuario}</span>
            <button
              type="button"
              onClick={() => {
                cerrarSesion();
                router.replace("/login");
              }}
              className="rounded border border-white/40 px-3 py-1 hover:bg-white/10"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl gap-4 px-5 py-2 text-sm">
            <Link href="/admin/paginas" className="hover:text-amarillo">
              Páginas
            </Link>
            <Link href="/admin/menu" className="hover:text-amarillo">
              Menú
            </Link>
            <Link href="/admin/respuestas" className="hover:text-amarillo">
              Respuestas
            </Link>
            {sesion.roles.includes("Admin") && (
              <Link href="/admin/usuarios" className="hover:text-amarillo">
                Usuarios
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
