"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listarMenu,
  crearMenu,
  actualizarMenu,
  reordenarMenu,
  eliminarMenu,
  AdminError,
  type MenuItem,
  type MenuGuardar,
} from "@/lib/admin-api";

const INPUT = "w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none";
const VACIO: MenuGuardar = { etiqueta: "", url: "", tipo: "contenido", estado: "publicado", padreId: null };

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | "nuevo" | null>(null);
  const [form, setForm] = useState<MenuGuardar>(VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setItems(await listarMenu());
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo cargar el menú.");
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

  function mover(i: number, dir: number) {
    if (!items) return;
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const ids = items.map((m) => m.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    accion(() => reordenarMenu(ids));
  }

  function abrirNuevo() {
    setForm(VACIO);
    setEditId("nuevo");
  }
  function abrirEditar(m: MenuItem) {
    setForm({ etiqueta: m.etiqueta, url: m.url, tipo: m.tipo, estado: m.estado, padreId: m.padreId });
    setEditId(m.id);
  }

  async function guardar() {
    if (!form.etiqueta.trim() || !form.url.trim()) {
      setError("Etiqueta y URL son obligatorias.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (editId === "nuevo") await crearMenu(form);
      else if (typeof editId === "number") await actualizarMenu(editId, form);
      setEditId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-2xl text-verde-osc">Menú del sitio</h1>
        {editId === null && (
          <button
            onClick={abrirNuevo}
            className="rounded-lg bg-rojo px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          >
            Nuevo ítem
          </button>
        )}
      </div>

      {error && <p className="mb-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      <ul className="space-y-2">
        {items?.map((m, i) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-[10px] border border-linea bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-xs disabled:opacity-30">
                  ▲
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === items.length - 1} className="text-xs disabled:opacity-30">
                  ▼
                </button>
              </div>
              <div>
                {m.padreId && <span className="mr-1 text-texto/40">↳</span>}
                <span className="font-semibold text-verde-osc">{m.etiqueta}</span>
                <span className="ml-2 font-mono text-xs text-texto/50">{m.url}</span>
                <span className="ml-2 text-xs text-texto/40">{m.tipo}</span>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => abrirEditar(m)} className="text-verde hover:underline">
                Editar
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar "${m.etiqueta}"?`)) accion(() => eliminarMenu(m.id));
                }}
                className="text-rojo hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {items?.length === 0 && <p className="text-sm text-texto/60">El menú está vacío.</p>}
      </ul>

      {editId !== null && (
        <div className="mt-6 rounded-[10px] border-2 border-verde/40 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-lg text-verde-osc">{editId === "nuevo" ? "Nuevo ítem" : "Editar ítem"}</h2>
            <button onClick={() => setEditId(null)} className="text-sm text-texto/60 hover:underline">
              Cancelar
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-verde-osc">Etiqueta</span>
              <input className={INPUT} value={form.etiqueta} onChange={(e) => setForm({ ...form, etiqueta: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-verde-osc">URL</span>
              <input className={INPUT} placeholder="/consultas o /#ofertas" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-verde-osc">Tipo</span>
              <select className={INPUT} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="contenido">Contenido</option>
                <option value="sistema">Sistema</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-verde-osc">Estado</span>
              <select className={INPUT} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="publicado">Publicado</option>
                <option value="borrador">Borrador</option>
                <option value="archivado">Archivado</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-verde-osc">Depende de (submenú, opcional)</span>
              <select
                className={INPUT}
                value={form.padreId ?? ""}
                onChange={(e) => setForm({ ...form, padreId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">— Ninguno (nivel raíz)</option>
                {items
                  ?.filter((m) => m.padreId === null && m.id !== editId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.etiqueta}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="mt-4 rounded-lg bg-rojo px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}
