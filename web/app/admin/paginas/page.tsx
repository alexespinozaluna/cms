"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  listarPaginas,
  cambiarEstadoPagina,
  eliminarPagina,
  AdminError,
  type PaginaAdmin,
} from "@/lib/admin-api";

const COLOR_ESTADO: Record<string, string> = {
  publicado: "bg-verde text-white",
  borrador: "bg-amarillo text-texto",
  archivado: "bg-linea text-texto/70",
};

export default function PaginasListPage() {
  const [paginas, setPaginas] = useState<PaginaAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setPaginas(await listarPaginas());
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudieron cargar las páginas.");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function accion(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo completar la acción.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-2xl text-verde-osc">Páginas</h1>
        <Link
          href="/admin/paginas/nueva"
          className="rounded-lg bg-rojo px-4 py-2 text-sm font-bold text-white hover:brightness-110"
        >
          Nueva página
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      <div className="overflow-x-auto rounded-[10px] border border-linea bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-papel text-left">
            <tr>
              {["Slug", "Título", "Estado", "Actualizado", "Acciones"].map((h) => (
                <th key={h} className="border-b border-linea px-3 py-2 font-semibold text-verde-osc">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginas?.map((p) => (
              <tr key={p.id} className="border-b border-linea">
                <td className="px-3 py-2 font-mono text-xs">/{p.slug}</td>
                <td className="px-3 py-2">{p.titulo}</td>
                <td className="px-3 py-2">
                  <span
                    className={`titular rounded-sm px-2 py-0.5 text-[11px] ${COLOR_ESTADO[p.estado] ?? "bg-linea"}`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-3 py-2 text-texto/60">
                  {new Date(p.actualizadoEn).toLocaleDateString("es-PE")}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link href={`/admin/paginas/${p.id}`} className="text-verde hover:underline">
                      Editar
                    </Link>
                    <Link href={`/admin/paginas/${p.id}/bloques`} className="text-verde hover:underline">
                      Bloques
                    </Link>
                    {p.estado !== "publicado" && (
                      <button
                        onClick={() => accion(() => cambiarEstadoPagina(p.id, "publicado"))}
                        className="text-verde hover:underline"
                      >
                        Publicar
                      </button>
                    )}
                    {p.estado !== "archivado" && (
                      <button
                        onClick={() => accion(() => cambiarEstadoPagina(p.id, "archivado"))}
                        className="text-texto/60 hover:underline"
                      >
                        Archivar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la página /${p.slug}?`)) accion(() => eliminarPagina(p.id));
                      }}
                      className="text-rojo hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginas?.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-texto/60">Aún no hay páginas.</p>
        )}
      </div>
    </div>
  );
}
