"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  listarBloques,
  listarTipos,
  crearBloque,
  actualizarBloque,
  reordenarBloques,
  eliminarBloque,
  AdminError,
  type Bloque,
  type TipoBloque,
  type ValorCampo,
} from "@/lib/admin-api";
import FormularioBloqueDinamico from "@/app/components/admin/FormularioBloqueDinamico";

interface Editor {
  tipo: TipoBloque;
  bloqueId?: number;
  contenido: Record<string, ValorCampo>;
  estado: string;
}

export default function BloquesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const paginaId = Number(id);
  const [bloques, setBloques] = useState<Bloque[] | null>(null);
  const [tipos, setTipos] = useState<TipoBloque[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [nuevoTipo, setNuevoTipo] = useState<string>("");

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const [b, t] = await Promise.all([listarBloques(paginaId), listarTipos()]);
      setBloques(b);
      setTipos(t);
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudieron cargar los bloques.");
    }
  }, [paginaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar(contenido: Record<string, ValorCampo>) {
    if (!editor) return;
    setGuardando(true);
    setError(null);
    try {
      if (editor.bloqueId) await actualizarBloque(editor.bloqueId, contenido, editor.estado);
      else await crearBloque(paginaId, editor.tipo.id, contenido, editor.estado);
      setEditor(null);
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo guardar el bloque.");
    } finally {
      setGuardando(false);
    }
  }

  async function accion(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo completar la acción.");
    }
  }

  function mover(i: number, dir: number) {
    if (!bloques) return;
    const j = i + dir;
    if (j < 0 || j >= bloques.length) return;
    const ids = bloques.map((b) => b.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    accion(() => reordenarBloques(paginaId, ids));
  }

  return (
    <div>
      <Link href="/admin/paginas" className="text-sm text-verde hover:underline">
        ← Páginas
      </Link>
      <h1 className="display mt-2 text-2xl text-verde-osc">Bloques de la página</h1>

      {error && <p className="mt-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      {/* Lista de bloques */}
      <ul className="mt-6 space-y-2">
        {bloques?.map((b, i) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-[10px] border border-linea bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-xs disabled:opacity-30">
                  ▲
                </button>
                <button
                  onClick={() => mover(i, 1)}
                  disabled={i === bloques.length - 1}
                  className="text-xs disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div>
                <span className="font-semibold text-verde-osc">{b.tipoNombre}</span>
                <span className="ml-2 text-xs text-texto/50">{b.tipoCodigo}</span>
                <span
                  className={`titular ml-2 rounded-sm px-1.5 py-0.5 text-[10px] ${b.estado === "publicado" ? "bg-verde text-white" : "bg-linea text-texto/70"}`}
                >
                  {b.estado}
                </span>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => setEditor({ tipo: tipos.find((t) => t.id === b.tipoBloqueId)!, bloqueId: b.id, contenido: b.contenido, estado: b.estado })}
                className="text-verde hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (confirm("¿Eliminar este bloque?")) accion(() => eliminarBloque(b.id));
                }}
                className="text-rojo hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {bloques?.length === 0 && <p className="text-sm text-texto/60">La página aún no tiene bloques.</p>}
      </ul>

      {/* Agregar bloque */}
      {!editor && (
        <div className="mt-6 flex items-end gap-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-verde-osc">Agregar bloque</label>
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="rounded-lg border border-linea bg-white px-3 py-2 text-sm"
            >
              <option value="">Elige un tipo…</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!nuevoTipo}
            onClick={() => {
              const tipo = tipos.find((t) => t.id === Number(nuevoTipo));
              if (tipo) setEditor({ tipo, contenido: {}, estado: "publicado" });
            }}
            className="rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      )}

      {/* Editor del bloque (formulario dinámico) */}
      {editor && (
        <div className="mt-6 rounded-[10px] border-2 border-verde/40 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-lg text-verde-osc">
              {editor.bloqueId ? "Editar" : "Nuevo"}: {editor.tipo.nombre}
            </h2>
            <button onClick={() => setEditor(null)} className="text-sm text-texto/60 hover:underline">
              Cancelar
            </button>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-verde-osc">Estado</label>
            <select
              value={editor.estado}
              onChange={(e) => setEditor({ ...editor, estado: e.target.value })}
              className="rounded-lg border border-linea bg-white px-3 py-2 text-sm"
            >
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
          <FormularioBloqueDinamico
            key={editor.bloqueId ?? "nuevo"}
            esquema={editor.tipo.esquemaCampos}
            inicial={editor.contenido}
            guardando={guardando}
            onGuardar={guardar}
          />
        </div>
      )}
    </div>
  );
}
