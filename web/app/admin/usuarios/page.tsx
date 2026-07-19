"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listarUsuarios,
  setRolesInternos,
  crearUsuarioInterno,
  AdminError,
  type UsuarioAdmin,
} from "@/lib/admin-api";

const INPUT = "w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none";
const INTERNOS = ["Editor", "Admin"];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ usuario: "", correo: "", password: "", roles: ["Editor"] as string[] });
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudieron cargar los usuarios.");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function toggleRol(u: UsuarioAdmin, rol: string) {
    const internos = u.roles.filter((r) => INTERNOS.includes(r));
    const nuevos = internos.includes(rol) ? internos.filter((r) => r !== rol) : [...internos, rol];
    setError(null);
    try {
      await setRolesInternos(u.id, nuevos);
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo actualizar el rol.");
    }
  }

  async function crear() {
    if (!nuevo.usuario.trim() || !nuevo.correo.trim() || nuevo.password.length < 8) {
      setError("Usuario, correo y contraseña (≥8) son obligatorios.");
      return;
    }
    setCreando(true);
    setError(null);
    try {
      await crearUsuarioInterno(nuevo);
      setNuevo({ usuario: "", correo: "", password: "", roles: ["Editor"] });
      await cargar();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo crear el usuario.");
    } finally {
      setCreando(false);
    }
  }

  return (
    <div>
      <h1 className="display text-2xl text-verde-osc">Usuarios y roles</h1>
      <p className="mt-1 text-sm text-texto/60">
        Asigna los roles internos <b>Editor</b> y <b>Admin</b>. Los roles del ERP (Cliente,
        Proveedor…) se gestionan solos al iniciar sesión.
      </p>

      {error && <p className="mt-4 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-[10px] border border-linea bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-papel text-left">
            <tr>
              {["Usuario", "Correo", "Origen", "Roles", "Editor", "Admin"].map((h) => (
                <th key={h} className="border-b border-linea px-3 py-2 font-semibold text-verde-osc">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios?.map((u) => (
              <tr key={u.id} className="border-b border-linea">
                <td className="px-3 py-2 font-semibold">{u.usuario}</td>
                <td className="px-3 py-2 text-texto/70">{u.correo}</td>
                <td className="px-3 py-2 text-xs text-texto/50">{u.esInterno ? "interno" : "ERP"}</td>
                <td className="px-3 py-2 text-xs text-texto/60">{u.roles.join(", ") || "—"}</td>
                {INTERNOS.map((rol) => (
                  <td key={rol} className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={u.roles.includes(rol)}
                      onChange={() => toggleRol(u, rol)}
                      className="h-4 w-4 accent-verde"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-2xl rounded-[10px] border border-linea bg-white p-5">
        <h2 className="display text-lg text-verde-osc">Nueva cuenta interna</h2>
        <p className="mt-1 text-xs text-texto/50">
          Para editores que no son personal del ERP. Ingresan con su usuario y contraseña.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-verde-osc">Usuario</span>
            <input className={INPUT} value={nuevo.usuario} onChange={(e) => setNuevo({ ...nuevo, usuario: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-verde-osc">Correo</span>
            <input className={INPUT} type="email" value={nuevo.correo} onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-verde-osc">Contraseña temporal</span>
            <input className={INPUT} type="text" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-verde-osc">Rol</span>
            <select
              className={INPUT}
              value={nuevo.roles[0] ?? "Editor"}
              onChange={(e) => setNuevo({ ...nuevo, roles: [e.target.value] })}
            >
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
        </div>
        <button
          onClick={crear}
          disabled={creando}
          className="mt-4 rounded-lg bg-rojo px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          {creando ? "Creando…" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}
