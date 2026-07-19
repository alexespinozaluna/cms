"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  crearPagina,
  actualizarPagina,
  AdminError,
  type PaginaAdmin,
  type PaginaGuardar,
} from "@/lib/admin-api";

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minúsculas, números y guiones (ej. nuestras-tiendas)."),
  titulo: z.string().min(1, "Requerido.").max(200),
  plantilla: z.string().min(1),
  estado: z.enum(["borrador", "publicado", "archivado"]),
  descripcionSeo: z.string().max(300).optional().or(z.literal("")),
  vigenciaDesde: z.string().optional().or(z.literal("")),
  vigenciaHasta: z.string().optional().or(z.literal("")),
});
type FormInput = z.infer<typeof schema>;

const INPUT = "w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none";

function paraInput(fecha: string | null): string {
  return fecha ? fecha.slice(0, 16) : "";
}

export default function FormularioPagina({ pagina }: { pagina?: PaginaAdmin }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: pagina
      ? {
          slug: pagina.slug,
          titulo: pagina.titulo,
          plantilla: pagina.plantilla,
          estado: pagina.estado as FormInput["estado"],
          descripcionSeo: pagina.descripcionSeo ?? "",
          vigenciaDesde: paraInput(pagina.vigenciaDesde),
          vigenciaHasta: paraInput(pagina.vigenciaHasta),
        }
      : { plantilla: "default", estado: "borrador" },
  });

  async function onSubmit(data: FormInput) {
    setError(null);
    const payload: PaginaGuardar = {
      slug: data.slug,
      titulo: data.titulo,
      plantilla: data.plantilla,
      estado: data.estado,
      descripcionSeo: data.descripcionSeo || null,
      vigenciaDesde: data.vigenciaDesde || null,
      vigenciaHasta: data.vigenciaHasta || null,
    };
    try {
      if (pagina) await actualizarPagina(pagina.id, payload);
      else await crearPagina(payload);
      router.push("/admin/paginas");
      router.refresh();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "No se pudo guardar la página.");
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/paginas" className="text-sm text-verde hover:underline">
        ← Páginas
      </Link>
      <h1 className="display mt-2 text-2xl text-verde-osc">
        {pagina ? "Editar página" : "Nueva página"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {error && <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

        <Campo etiqueta="Slug (URL)" error={errors.slug?.message}>
          <input className={INPUT} placeholder="nuestras-tiendas" {...register("slug")} />
        </Campo>
        <Campo etiqueta="Título" error={errors.titulo?.message}>
          <input className={INPUT} {...register("titulo")} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Plantilla" error={errors.plantilla?.message}>
            <input className={INPUT} {...register("plantilla")} />
          </Campo>
          <Campo etiqueta="Estado" error={errors.estado?.message}>
            <select className={INPUT} {...register("estado")}>
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Descripción SEO (opcional)" error={errors.descripcionSeo?.message}>
          <textarea className={INPUT} rows={2} {...register("descripcionSeo")} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Vigencia desde (opcional)" error={errors.vigenciaDesde?.message}>
            <input type="datetime-local" className={INPUT} {...register("vigenciaDesde")} />
          </Campo>
          <Campo etiqueta="Vigencia hasta (opcional)" error={errors.vigenciaHasta?.message}>
            <input type="datetime-local" className={INPUT} {...register("vigenciaHasta")} />
          </Campo>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-rojo px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}

function Campo({
  etiqueta,
  error,
  children,
}: {
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-verde-osc">{etiqueta}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rojo">{error}</p>}
    </div>
  );
}
