import { sitio } from "@/lib/sitio";
import Marca from "./Marca";

export default function Footer() {
  return (
    <footer className="mt-auto bg-verde-osc text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm md:flex-row md:justify-between md:text-left">
        <p className="titular text-lg">
          <Marca claseAcento="text-amarillo" />
        </p>
        <p className="text-white/80">
          © {new Date().getFullYear()} {sitio.slogan || sitio.nombre}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
