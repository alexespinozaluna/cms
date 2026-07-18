"use client";

import { useState } from "react";
import type { FormularioCampo, FormularioContenido } from "@/lib/content-api";

function Campo({ campo }: { campo: FormularioCampo }) {
  const base =
    "mt-1 w-full border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none";

  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {campo.etiqueta}
        {campo.requerido && <span className="text-rojo"> *</span>}
      </span>
      {campo.tipo === "textolargo" ? (
        <textarea name={campo.nombre} required={campo.requerido} rows={4} className={base} />
      ) : campo.tipo === "opcion" ? (
        <select name={campo.nombre} required={campo.requerido} className={base} defaultValue="">
          <option value="" disabled>
            Seleccione…
          </option>
          {(campo.opciones ?? []).map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={campo.nombre}
          required={campo.requerido}
          type={
            campo.tipo === "numero"
              ? "number"
              : campo.tipo === "fecha"
                ? "date"
                : campo.tipo === "correo"
                  ? "email"
                  : "text"
          }
          className={base}
        />
      )}
    </label>
  );
}

/** Formulario dinámico definido por el editor; envía las respuestas a la Content API. */
export default function FormularioBloque({
  bloqueId,
  contenido,
  urlEnvio,
}: {
  bloqueId: number;
  contenido: FormularioContenido;
  urlEnvio: string;
}) {
  const [estado, setEstado] = useState<"inicial" | "enviando" | "ok" | "error">("inicial");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    const datos = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(urlEnvio, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      setEstado(res.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <section className="mx-auto max-w-xl px-4 py-12">
        <p className="border border-verde bg-verde/10 p-4 text-verde-osc" role="status">
          ¡Gracias! Recibimos tu respuesta.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      {contenido.titulo && <h2 className="titular text-2xl">{contenido.titulo}</h2>}
      <form onSubmit={enviar} className="mt-6 space-y-4" data-bloque={bloqueId}>
        {contenido.campos.map((campo) => (
          <Campo key={campo.nombre} campo={campo} />
        ))}
        {estado === "error" && (
          <p className="text-sm text-rojo" role="alert">
            No pudimos enviar tu respuesta. Inténtalo de nuevo.
          </p>
        )}
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="titular bg-rojo px-6 py-2 text-white hover:bg-verde disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </section>
  );
}
