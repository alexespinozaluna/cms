import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="titular inline-block rotate-[-2deg] bg-amarillo px-4 py-2 text-sm">
        Página no encontrada
      </p>
      <h1 className="titular mt-6 text-6xl text-rojo">404</h1>
      <p className="mt-4 text-texto/70">La página que buscas no existe o ya no está vigente.</p>
      <Link href="/" className="titular mt-8 inline-block bg-verde px-6 py-2 text-white hover:bg-verde-osc">
        Volver al inicio
      </Link>
    </section>
  );
}
