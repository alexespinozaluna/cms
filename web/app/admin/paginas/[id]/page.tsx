"use client";

import { use, useEffect, useState } from "react";
import FormularioPagina from "@/app/components/admin/FormularioPagina";
import { obtenerPagina, AdminError, type PaginaAdmin } from "@/lib/admin-api";

export default function EditarPaginaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pagina, setPagina] = useState<PaginaAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerPagina(Number(id))
      .then(setPagina)
      .catch((e) => setError(e instanceof AdminError ? e.message : "No se pudo cargar la página."));
  }, [id]);

  if (error) return <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>;
  if (!pagina) return null;
  return <FormularioPagina pagina={pagina} />;
}
