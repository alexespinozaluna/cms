import type { Bloque } from "@/lib/content-api";
import { urlRespuestasFormulario } from "@/lib/content-api";
import BandaPortales from "./BandaPortales";
import FormularioBloque from "./FormularioBloque";
import GrillaConcesionarios from "./GrillaConcesionarios";
import GrillaNoticias from "./GrillaNoticias";
import GrillaOfertas from "./GrillaOfertas";
import HeroCartel from "./HeroCartel";
import ListaTiendas from "./ListaTiendas";
import TextoRico from "./TextoRico";

/** Traduce cada bloque del CMS (por su código de tipo) al componente del diseño. */
export default function BlockRenderer({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case "hero_cartel":
      return <HeroCartel contenido={bloque.contenido} />;
    case "grilla_ofertas":
      return <GrillaOfertas contenido={bloque.contenido} />;
    case "lista_tiendas":
      return <ListaTiendas contenido={bloque.contenido} />;
    case "grilla_concesionarios":
      return <GrillaConcesionarios contenido={bloque.contenido} />;
    case "grilla_noticias":
      return <GrillaNoticias contenido={bloque.contenido} />;
    case "banda_portales":
      return <BandaPortales contenido={bloque.contenido} />;
    case "texto_rico":
      return <TextoRico contenido={bloque.contenido} />;
    case "formulario":
      return (
        <FormularioBloque
          bloqueId={bloque.id}
          contenido={bloque.contenido}
          urlEnvio={urlRespuestasFormulario(bloque.id)}
        />
      );
    default:
      // Tipo aún sin componente: no rompe la página
      return null;
  }
}
