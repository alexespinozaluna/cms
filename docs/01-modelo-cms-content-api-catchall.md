# Proceso 1 — Modelo CMS en PostgreSQL + Content API + catch-all en Next.js

**Fecha:** 17/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado end-to-end (17/07/2026)

Primer paso del roadmap: la base del CMS metadata-driven, la API pública de
contenido y el renderizado dinámico en Next.js.

## 1. Qué se hizo

### 1.1 Modelo de datos del CMS (PostgreSQL)

Script: `api/db/postgres/cms_modelo_postgresql.sql` (DDL + datos semilla,
aplicado sobre la BD `tubazar_cms`).

Tablas:

| Tabla | Rol |
|---|---|
| `tipos_bloque` | El corazón metadata-driven: cada fila define un tipo de bloque y el esquema de sus campos (`esquema_campos` JSONB). El admin lo usará para pintar formularios de edición; la API validará contra él |
| `paginas` | Una fila por página del sitio (slug, título, plantilla, `estado`, vigencia) |
| `bloques` | Contenido de cada página: FK a `paginas` y `tipos_bloque`, `orden`, `contenido` JSONB, `estado`, vigencia |
| `menu_items` | Menú del sitio como data (`etiqueta`, `url`, `tipo: contenido|sistema`, `orden`) |
| `form_respuestas` | Respuestas de bloques de formulario dinámico |

Objetos de apoyo:

- Función `fne_vigente(estado, desde, hasta)` (STABLE): encapsula la regla
  "publicado y dentro de vigencia, con NULL = sin límite".
- Vistas `v_paginas_publicas`, `v_bloques_publicos`, `v_menu_publico`: **la
  regla de visibilidad pública vive aquí**, la API solo las consulta.
- Índice parcial `ix_paginas_slug_publicada` para el lookup por slug.

Datos semilla:

- 8 tipos de bloque: `hero_cartel`, `grilla_ofertas`, `lista_tiendas`,
  `grilla_concesionarios`, `grilla_noticias`, `banda_portales`, `texto_rico`,
  `formulario`.
- Datos de prueba: página `inicio` (publicada, con 3 bloques: una
  `grilla_ofertas` y dos `texto_rico`), página `oculta` (borrador, para probar
  el filtro), y 4 ítems de menú (uno apunta a `/oculto` para verificar que el
  menú público lo excluya).

### 1.2 Content API (ASP.NET Core 8)

Proyectos: `api/src/Cms.Api` (host + controllers) y
`api/src/Cms.Content` (dominio CMS: Dapper + Npgsql, DTOs, repositorio).

Endpoints públicos (`ContenidoController`, ruta base `api/contenido`):

| Método y ruta | Función |
|---|---|
| `GET /api/contenido/paginas/{slug}` | Página + bloques para el catch-all; 404 si no existe/no visible |
| `GET /api/contenido/menu` | Menú público del sitio |
| `POST /api/contenido/formularios/{bloqueId}/respuestas` | Guarda respuesta de formulario dinámico (valida que el cuerpo sea objeto JSON no vacío) |
| `GET /health` | Sondeo de salud para IIS/ARR |

- CORS: política `Frontend` con orígenes desde `Cors:Origenes`
  (dev: `http://localhost:3000`).
- Swagger habilitado solo en Development.
- Cadena de conexión `CmsDb` en `appsettings.Development.json`.

### 1.3 Frontend (Next.js App Router + Tailwind)

En `web/`:

- `app/[...slug]/page.tsx`: catch-all que consulta la Content API por slug y
  renderiza; slug inexistente → `notFound()`. `app/page.tsx` renderiza el
  slug `inicio`.
- `app/components/blocks/`: un componente por tipo de bloque (`HeroCartel`,
  `GrillaOfertas`, `ListaTiendas`, `GrillaConcesionarios`, `GrillaNoticias`,
  `BandaPortales`, `TextoRico`, `FormularioBloque`) + `BlockRenderer` que
  mapea `codigo` de tipo → componente.
- `app/components/site/`: `Header` (menú desde la API), `Footer`, `PaginaCms`.
- `lib/content-api.ts`: cliente tipado de la Content API;
  `lib/formato.ts`: helpers de formato.
- Variables de entorno (`.env.local`, plantilla en `.env.example`):
  `CONTENT_API_URL` (server) y `NEXT_PUBLIC_CONTENT_API_URL` (navegador,
  para envío de formularios), ambas `http://localhost:5080` en dev.

## 2. Decisiones tomadas

- **La regla "publicado y vigente" vive en las vistas de PostgreSQL**, no en
  C#: imposible saltársela desde un endpoint nuevo por accidente.
- `fne_vigente` es STABLE (no IMMUTABLE) porque depende de `now()`.
- **Slugs reservados** (`registro, login, recuperar, cliente, proveedor,
  admin, api`) se validan con CHECK en `paginas` además de la futura
  validación en la API del CMS — defensa en profundidad.
- FK `form_respuestas → bloques` con `ON DELETE RESTRICT`: la política es
  **archivar** páginas/bloques, no borrarlos, para no perder respuestas.
- Puerto de la API en dev: **5080** (alineado en `launchSettings.json` y en
  los `.env` del frontend; corregido el 17/07/2026 — antes decía 5144).
- **El código es genérico (17/07/2026)**: los proyectos .NET pasaron de
  `TuBazar.*` a `Cms.*` (solución `Cms.sln`) y la marca del sitio salió del
  código: vive en `web/.env.local` (`NEXT_PUBLIC_SITE_NAME`, `_NAME_ACCENT`,
  `_SLOGAN`, `_DESCRIPTION`), expuesta por `web/lib/sitio.ts` y el componente
  `Marca`. "TuBazar" es solo la primera instancia configurada.

## 3. Cómo ejecutarlo/probarlo en local

Requisitos: PostgreSQL 18 (servicio `postgresql-x64-18`), SDK .NET 8, Node.

1. **BD** (ya aplicada; solo si se parte de cero):
   `psql -U postgres -c "CREATE DATABASE tubazar_cms;"` y luego ejecutar
   `api/db/postgres/cms_modelo_postgresql.sql` sobre esa BD.
2. **API**: `dotnet run --project api/src/Cms.Api` → Swagger en
   `http://localhost:5080/swagger`. Probar
   `GET http://localhost:5080/api/contenido/paginas/inicio` (200 con bloques)
   y `.../paginas/oculta` (404, está en borrador).
3. **Web**: `cd web && npm install && npm run dev` →
   `http://localhost:3000` debe renderizar la página `inicio` con sus 3
   bloques; `http://localhost:3000/oculta` debe dar 404; el menú del header
   no debe mostrar "Oculto".

## 4. Pendientes conocidos

- ~~Prueba end-to-end~~ **ejecutada el 17/07/2026**: API verificada desde
  Visual Studio (menú con jerarquía y sin ítems ocultos; página `inicio` con
  bloques) y web verificada (`/` renderiza inicio con ofertas y marca desde
  configuración, `/oculta` → 404, menú sin "Oculto").
- Todo el trabajo de `web/` está sin commitear (solo existe el commit inicial
  de Create Next App); `api/` no es repo git.
- La validación de `bloques.contenido` contra `tipos_bloque.esquema_campos`
  al guardar aún no existe (llegará con la API de administración del CMS).
- Resolución de precios `origen: "erp"` pendiente (requiere SPs del ERP,
  pasos 3-4 del roadmap).
