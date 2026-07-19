"use client";

import { useState } from "react";
import type { CampoEsquema, ValorCampo } from "@/lib/admin-api";

const INPUT =
  "w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none";

function str(v: ValorCampo): string {
  return v === undefined || v === null ? "" : String(v);
}

function CampoInput({
  campo,
  valor,
  onChange,
}: {
  campo: CampoEsquema;
  valor: ValorCampo;
  onChange: (v: ValorCampo) => void;
}) {
  const label = (
    <label className="mb-1 block text-sm font-semibold text-verde-osc">
      {campo.etiqueta}
      {campo.requerido && <span className="text-rojo"> *</span>}
    </label>
  );

  if (campo.tipo === "lista") return <CampoLista campo={campo} valor={valor} onChange={onChange} />;

  switch (campo.tipo) {
    case "textolargo":
      return (
        <div>
          {label}
          <textarea className={INPUT} rows={3} value={str(valor)} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "opcion":
      return (
        <div>
          {label}
          <select className={INPUT} value={str(valor)} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {campo.opciones?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "decimal":
      return (
        <div>
          {label}
          <input
            type="number"
            step="0.01"
            className={INPUT}
            value={valor === undefined || valor === null ? "" : Number(valor)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      );
    case "fecha":
      return (
        <div>
          {label}
          <input type="date" className={INPUT} value={str(valor)} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    default: // texto, imagen
      return (
        <div>
          {label}
          <input
            className={INPUT}
            placeholder={campo.tipo === "imagen" ? "/media/…" : undefined}
            value={str(valor)}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

function CampoLista({
  campo,
  valor,
  onChange,
}: {
  campo: CampoEsquema;
  valor: ValorCampo;
  onChange: (v: ValorCampo) => void;
}) {
  const items: Record<string, ValorCampo>[] = Array.isArray(valor)
    ? (valor as Record<string, ValorCampo>[])
    : [];
  const sub = campo.campos ?? [];

  const setItem = (i: number, nombre: string, v: ValorCampo) => {
    const copia = items.map((it, j) => (j === i ? { ...it, [nombre]: v } : it));
    onChange(copia);
  };

  return (
    <div className="rounded-lg border border-linea p-3">
      <p className="mb-2 text-sm font-semibold text-verde-osc">
        {campo.etiqueta}
        {campo.requerido && <span className="text-rojo"> *</span>}
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded border border-linea/70 bg-papel p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-texto/50">#{i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-xs text-rojo hover:underline"
              >
                Quitar
              </button>
            </div>
            <div className="space-y-3">
              {sub.map((s) => (
                <CampoInput
                  key={s.nombre}
                  campo={s}
                  valor={item[s.nombre]}
                  onChange={(v) => setItem(i, s.nombre, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, {}])}
        className="mt-2 text-sm font-semibold text-verde hover:underline"
      >
        + Agregar elemento
      </button>
    </div>
  );
}

/** Formulario generado desde `esquema` (metadata del tipo de bloque). */
export default function FormularioBloqueDinamico({
  esquema,
  inicial,
  guardando,
  onGuardar,
}: {
  esquema: CampoEsquema[];
  inicial: Record<string, ValorCampo>;
  guardando: boolean;
  onGuardar: (contenido: Record<string, ValorCampo>) => void;
}) {
  const [valores, setValores] = useState<Record<string, ValorCampo>>(inicial ?? {});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(valores);
      }}
      className="space-y-4"
    >
      {esquema.map((c) => (
        <CampoInput
          key={c.nombre}
          campo={c}
          valor={valores[c.nombre]}
          onChange={(v) => setValores((prev) => ({ ...prev, [c.nombre]: v }))}
        />
      ))}
      <button
        type="submit"
        disabled={guardando}
        className="rounded-lg bg-rojo px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar bloque"}
      </button>
    </form>
  );
}
