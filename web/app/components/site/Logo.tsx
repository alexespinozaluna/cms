import { sitio } from "@/lib/sitio";
import { resolverMedia } from "@/lib/media";
import Marca from "./Marca";

/**
 * Logo del sitio. Si la instancia configuró una imagen de logo la usa; si no,
 * cae al wordmark de texto (componente Marca). La marca es siempre config,
 * nunca código.
 */
export default function Logo({
  variante,
  claseAcento,
  className,
}: {
  variante: "color" | "blanco";
  claseAcento: string;
  className?: string;
}) {
  const src = variante === "blanco" ? sitio.logoBlanco : sitio.logo;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolverMedia(src)} alt={sitio.nombre} className={className} />;
  }
  return <Marca claseAcento={claseAcento} />;
}
