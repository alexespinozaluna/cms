import type { PaginaDetalle } from "@/lib/content-api";
import BlockRenderer from "../blocks/BlockRenderer";

/** Renderiza una página del CMS: sus bloques ya vienen publicados, vigentes y ordenados. */
export default function PaginaCms({ pagina }: { pagina: PaginaDetalle }) {
  return (
    <>
      {pagina.bloques.map((bloque) => (
        <BlockRenderer key={bloque.id} bloque={bloque} />
      ))}
    </>
  );
}
