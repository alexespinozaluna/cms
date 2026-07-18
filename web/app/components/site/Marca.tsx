import { sitio } from "@/lib/sitio";

/**
 * Wordmark del sitio: renderiza el nombre resaltando en color la parte
 * configurada en NEXT_PUBLIC_SITE_NAME_ACCENT (ej. "Bazar" en "TuBazar").
 */
export default function Marca({ claseAcento }: { claseAcento: string }) {
  const { nombre, acento } = sitio;
  if (!acento || !nombre.includes(acento)) return <>{nombre}</>;

  const inicio = nombre.indexOf(acento);
  return (
    <>
      {nombre.slice(0, inicio)}
      <span className={claseAcento}>{acento}</span>
      {nombre.slice(inicio + acento.length)}
    </>
  );
}
