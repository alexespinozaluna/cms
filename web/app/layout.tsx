import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./components/site/Footer";
import Header from "./components/site/Header";
import { obtenerMenu } from "@/lib/content-api";
import { sitio } from "@/lib/sitio";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  // Fuente variable: se cargan los ejes de peso (por defecto) y ancho (wdth)
  // para reproducir el Archivo condensado de la maqueta (font-stretch).
  axes: ["wdth"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: sitio.slogan ? `${sitio.nombre} — ${sitio.slogan}` : sitio.nombre,
    template: `%s | ${sitio.nombre}`,
  },
  description: sitio.descripcion,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menu = await obtenerMenu();

  return (
    <html lang="es" className={`${archivo.variable} ${publicSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header menu={menu} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
