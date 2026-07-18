import { obtenerPagina } from "@/lib/content-api";
import { sitio } from "@/lib/sitio";
import PaginaCms from "./components/site/PaginaCms";

export const revalidate = 60;

/** Portada: es la página 'inicio' del CMS. */
export default async function Home() {
  const pagina = await obtenerPagina("inicio");

  if (!pagina) {
    // La portada aún no está publicada en el CMS: no es un 404 del sitio
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="titular text-4xl">{sitio.nombre}</h1>
        <p className="mt-4 text-texto/70">Estamos preparando el contenido. Vuelve pronto.</p>
      </section>
    );
  }

  return <PaginaCms pagina={pagina} />;
}
