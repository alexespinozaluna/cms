/** Contenedor centrado para las pantallas de autenticación. */
export default function AuthShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="display text-3xl text-verde-osc">{titulo}</h1>
      {subtitulo && <p className="mt-2 text-sm text-texto/70">{subtitulo}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
