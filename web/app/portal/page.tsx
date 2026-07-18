"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerSesion, type Sesion } from "@/lib/auth";
import { seccionesDeRoles } from "@/lib/portal";

export default function PortalPage() {
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      router.replace("/login?next=/portal");
      return;
    }
    setSesion(s);
    setListo(true);
  }, [router]);

  if (!listo || !sesion) return null;

  const secciones = seccionesDeRoles(sesion.roles);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="border-b border-linea pb-6">
        <p className="text-sm text-texto/60">Mi portal</p>
        <h1 className="display text-3xl text-verde-osc md:text-4xl">
          Hola, {sesion.nombre || sesion.usuario}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {sesion.roles.map((rol) => (
            <span
              key={rol}
              className="titular rounded-sm bg-verde px-2.5 py-1 text-xs tracking-wide text-white"
            >
              {rol}
            </span>
          ))}
        </div>
      </header>

      {secciones.length === 0 ? (
        <p className="mt-8 text-sm text-texto/70">
          Tu cuenta no tiene opciones habilitadas todavía. Comunícate con la administración del
          bazar.
        </p>
      ) : (
        secciones.map((seccion) => (
          <section key={seccion.rol} className="mt-10">
            <h2 className="display text-2xl text-verde-osc">{seccion.etiqueta}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {seccion.opciones.map((op) => {
                const contenido = (
                  <article className="flex h-full flex-col rounded-[10px] border border-linea bg-white p-5 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="display text-lg text-verde-osc">{op.titulo}</h3>
                      {!op.disponible && (
                        <span className="titular shrink-0 rounded-sm bg-papel px-2 py-0.5 text-[10px] tracking-wide text-texto/50">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-texto/70">{op.descripcion}</p>
                  </article>
                );
                return op.disponible && op.href ? (
                  <Link key={op.titulo} href={op.href} className="block h-full">
                    {contenido}
                  </Link>
                ) : (
                  <div key={op.titulo} className="cursor-default opacity-80">
                    {contenido}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
