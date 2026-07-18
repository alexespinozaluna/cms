"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { obtenerSesion, cerrarSesion, type Sesion } from "@/lib/auth";

/** Acciones de sesión del header: "Iniciar sesión" o el correo + "Salir". */
export default function SesionAcciones() {
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setSesion(obtenerSesion());
    setListo(true);
  }, []);

  // Evita parpadeo/mismatch de hidratación: no renderiza hasta leer localStorage.
  if (!listo) return null;

  if (sesion) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/portal"
          className="hidden max-w-[16ch] truncate text-sm font-semibold text-verde-osc hover:text-rojo md:inline"
        >
          {sesion.nombre || sesion.usuario}
        </Link>
        <button
          type="button"
          onClick={() => {
            cerrarSesion();
            setSesion(null);
            router.refresh();
          }}
          className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel"
    >
      Iniciar sesión
    </Link>
  );
}
