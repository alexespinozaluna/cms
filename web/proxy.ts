import { NextResponse, type NextRequest } from "next/server";

/**
 * Guarda de ruta del portal (convención `proxy` de Next 16, antes middleware):
 * sin la cookie de sesión (`tb_sesion`) redirige a /login conservando el
 * destino en `next`. La validación real del token la hace la API; esto solo
 * evita mostrar la página protegida.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("tb_sesion")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
