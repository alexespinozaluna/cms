import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerPagina } from "@/lib/content-api";
import PaginaCms from "../components/site/PaginaCms";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string[] }> };

// Los slugs del CMS son planos; segmentos anidados no coinciden y caen en 404.
// Next.js dedup­lica el fetch entre generateMetadata y la página.
async function paginaDesdeParams({ params }: Props) {
  const { slug } = await params;
  if (slug.length !== 1) return null;
  return obtenerPagina(slug[0]);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const pagina = await paginaDesdeParams(props);
  if (!pagina) return {};
  return {
    title: pagina.titulo,
    description: pagina.descripcionSeo ?? undefined,
  };
}

export default async function PaginaContenido(props: Props) {
  const pagina = await paginaDesdeParams(props);
  if (!pagina) notFound();
  return <PaginaCms pagina={pagina} />;
}
