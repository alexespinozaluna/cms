"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listarFormularios,
  listarRespuestas,
  descargarRespuestasExcel,
  AdminError,
  type FormularioResumen,
  type Respuesta,
} from "@/lib/admin-api";

export default function RespuestasPage() {
  const [formularios, setFormularios] = useState<FormularioResumen[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarFormularios()
      .then(setFormularios)
      .catch((e) => setError(e instanceof AdminError ? e.message : "No se pudieron cargar los formularios."));
  }, []);

  const cargarRespuestas = useCallback(async (bloqueId: number) => {
    setSel(bloqueId);
    setRespuestas(null);
    setError(null);
    try {
      setRespuestas(await listarRespuestas(bloqueId));
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudieron cargar las respuestas.");
    }
  }, []);

  const columnas = respuestas
    ? Array.from(new Set(respuestas.flatMap((r) => Object.keys(r.datos))))
    : [];

  return (
    <div>
      <h1 className="display text-2xl text-verde-osc">Respuestas de formularios</h1>
      {error && <p className="mt-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      {formularios.length === 0 ? (
        <p className="mt-6 text-sm text-texto/60">
          No hay bloques de formulario en el sitio todavía. Crea uno desde el editor de bloques de
          una página.
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-verde-osc">Formulario</span>
            <select
              value={sel ?? ""}
              onChange={(e) => e.target.value && cargarRespuestas(Number(e.target.value))}
              className="rounded-lg border border-linea bg-white px-3 py-2 text-sm"
            >
              <option value="">Elige un formulario…</option>
              {formularios.map((f) => (
                <option key={f.bloqueId} value={f.bloqueId}>
                  {f.titulo || f.paginaTitulo} — /{f.slug} ({f.total})
                </option>
              ))}
            </select>
          </label>
          {sel && respuestas && respuestas.length > 0 && (
            <button
              onClick={() =>
                descargarRespuestasExcel(sel).catch((e) =>
                  setError(e instanceof AdminError ? e.message : "No se pudo descargar."),
                )
              }
              className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel"
            >
              Descargar Excel
            </button>
          )}
        </div>
      )}

      {respuestas && (
        <div className="mt-6 overflow-x-auto rounded-[10px] border border-linea bg-white">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-papel text-left">
              <tr>
                <th className="border-b border-linea px-3 py-2 font-semibold text-verde-osc">Fecha</th>
                {columnas.map((c) => (
                  <th key={c} className="border-b border-linea px-3 py-2 font-semibold text-verde-osc">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {respuestas.map((r) => (
                <tr key={r.id} className="border-b border-linea">
                  <td className="px-3 py-2 text-texto/60">
                    {new Date(r.creadoEn).toLocaleString("es-PE")}
                  </td>
                  {columnas.map((c) => (
                    <td key={c} className="px-3 py-2">
                      {String(r.datos[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {respuestas.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-texto/60">Este formulario aún no tiene respuestas.</p>
          )}
        </div>
      )}
    </div>
  );
}
