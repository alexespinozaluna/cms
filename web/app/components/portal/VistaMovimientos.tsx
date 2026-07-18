"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { PortalError, type Movimiento } from "@/lib/portal-api";
import TablaMovimientos from "./TablaMovimientos";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Vista transaccional genérica del portal (guarda de rol + rango de fechas +
 * tabla). Reutilizada por Mis compras, Estado de cuenta y Liquidación de pagos.
 */
export default function VistaMovimientos({
  titulo,
  ruta,
  rolesOk,
  fetcher,
}: {
  titulo: string;
  ruta: string;
  rolesOk: string[];
  fetcher: (desde?: string, hasta?: string) => Promise<Movimiento[]>;
}) {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [datos, setDatos] = useState<Movimiento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const hoy = new Date();
  const haceDos = new Date();
  haceDos.setMonth(haceDos.getMonth() - 2);
  const [desde, setDesde] = useState(iso(haceDos));
  const [hasta, setHasta] = useState(iso(hoy));

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      router.replace(`/login?next=${ruta}`);
      return;
    }
    if (!s.roles.some((r) => rolesOk.includes(r))) {
      router.replace("/portal");
      return;
    }
    setListo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const cargar = useCallback(async () => {
    setError(null);
    setCargando(true);
    try {
      setDatos(await fetcher(desde, hasta));
    } catch (e) {
      setError(e instanceof PortalError ? e.message : "No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, fetcher]);

  useEffect(() => {
    if (listo) cargar();
    // solo la carga inicial; los cambios de rango se piden con "Ver"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  if (!listo) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/portal" className="text-sm text-verde hover:underline">
        ← Mi portal
      </Link>
      <h1 className="display mt-2 text-3xl text-verde-osc md:text-4xl">{titulo}</h1>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-verde-osc">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-linea bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-verde-osc">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-linea bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={cargar}
          disabled={cargando}
          className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel disabled:opacity-60"
        >
          {cargando ? "Cargando…" : "Ver"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      <div className="mt-6">{datos && <TablaMovimientos datos={datos} />}</div>
    </div>
  );
}
