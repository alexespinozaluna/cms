# 202607180004 — Portal: dashboards por rol (hub `/portal`)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** shell v1 completado y verificado (18/07/2026)

Tras el login único, la persona entra a un **hub único `/portal`** que muestra
las opciones según sus roles del ERP (combinables). Las vistas con datos reales
(estado de cuenta, facturas, etc.) quedan como "Próximamente" hasta tener los
SPs del ERP (roadmap 4-5); esta entrega es el armazón que ya enruta por rol.

## 1. Qué se hizo (frontend)

- **`web/lib/portal.ts`**: configuración de opciones por rol (`Cliente`,
  `Proveedor`, `Concesionario`, `Trabajador`) — fácil de afinar. Cada opción
  tiene `disponible` (false = "Próximamente") y `href`. `seccionesDeRoles(roles)`
  arma las secciones en orden fijo para los roles presentes.
- **`web/app/portal/page.tsx`** (client): saludo con el nombre, chips de roles y
  una sección por rol con tarjetas de opciones. Guarda de respaldo: si no hay
  sesión en `localStorage`, redirige a `/login?next=/portal`.
- **`web/proxy.ts`** (convención `proxy` de Next 16, antes `middleware`): guarda
  de ruta en el borde — sin la cookie `tb_sesion` redirige a `/login` con `next`.
  Matcher `"/portal/:path*"`.
- Redirección tras login/registro: ahora va a `/portal` (antes `/`).
- `SesionAcciones`: el nombre del usuario en el header enlaza a `/portal`.
- `portal` agregado a los slugs reservados (CLAUDE.md §6).

## 2. Cómo se probó

Verificado el 18/07/2026 (build de producción, puerto alterno):
- `/portal` **sin** cookie de sesión → **307** a `/login?next=%2Fportal`.
- `/portal` **con** cookie `tb_sesion` → **200**.
- `/login` sigue accesible (200).
- `tsc` y `npm run build` sin errores; sin warning de deprecación de middleware.

El render por rol es client-side (lee `roles` de la sesión en `localStorage`);
el backend ya devuelve los roles correctos (verificado contra el ERP real).

## 3. Pendientes conocidos

- **Datos reales por opción**: falta cablear cada tarjeta a su SP de solo
  lectura del ERP (estado de cuenta y compras del cliente; facturas y pagos del
  proveedor; concesión; boletas del trabajador) — roadmap 4 y 5.
- **Envío del token a la API**: cuando las vistas consulten datos protegidos,
  hay que mandar `Authorization: Bearer <token>` (el token está en la sesión de
  `localStorage`) y proteger los endpoints con `[Authorize(Roles=...)]`.
- **Definir el detalle de opciones** de concesionario y trabajador con el
  negocio (hoy son un mínimo razonable).
- **Slug reservado `portal`**: agregado a la doc; falta reflejarlo en el CHECK
  de `paginas` y en la futura validación del CMS (el route de archivo ya
  prevalece sobre el catch-all, así que no hay riesgo funcional inmediato).
