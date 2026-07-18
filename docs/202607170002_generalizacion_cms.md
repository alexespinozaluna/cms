# Proceso 2 — Generalización: de "TuBazar" a CMS genérico para retail

**Fecha:** 17/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (17/07/2026)

El proyecto deja de ser explícitamente para TuBazar: el código es un **CMS
genérico y parametrizable para retail**, y TuBazar pasa a ser solo la primera
instancia configurada. Nada de marca en el código; la identidad vive en
configuración.

## 1. Qué se hizo

### 1.1 Renombrado de la solución .NET

| Antes | Después |
|---|---|
| `api/TuBazar.sln` | `api/Cms.sln` |
| `api/src/TuBazar.Api/` (+ csproj) | `api/src/Cms.Api/` |
| `api/src/TuBazar.Content/` (+ csproj) | `api/src/Cms.Content/` |
| Namespaces `TuBazar.Api.*` / `TuBazar.Content.*` | `Cms.Api.*` / `Cms.Content.*` |

Se actualizaron carpetas, archivos de proyecto, la solución (conservando los
GUID), los `using` y todos los namespaces; se limpiaron `bin/`, `obj/` y `.vs/`.
Compila con **0 errores y 0 advertencias**. En Visual Studio ahora se abre
`api/Cms.sln`.

### 1.2 Marca del sitio fuera del código (frontend)

- **`web/lib/sitio.ts`** (nuevo): único punto que lee la identidad de la
  instancia desde variables de entorno.
- **`web/app/components/site/Marca.tsx`** (nuevo): wordmark del sitio;
  resalta en color la parte del nombre configurada como acento (con
  `TuBazar`/`Bazar` reproduce el logo bicolor original; sin acento renderiza
  el nombre plano).
- `layout.tsx` (título y descripción SEO), `page.tsx` (portada de respaldo),
  `Header` (topbar institucional y logo) y `Footer` (logo y copyright) ya no
  contienen ningún texto de marca.

Variables (en `web/.env.local`, plantilla en `web/.env.example`):

| Variable | Rol | Valor instancia TuBazar |
|---|---|---|
| `NEXT_PUBLIC_SITE_NAME` | Nombre corto (wordmark, títulos) | `TuBazar` |
| `NEXT_PUBLIC_SITE_NAME_ACCENT` | Parte del nombre resaltada en color | `Bazar` |
| `NEXT_PUBLIC_SITE_SLOGAN` | Nombre institucional (topbar, ©) | `Bazar Central del Ejército del Perú` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Descripción SEO | `Ofertas, tiendas y servicios…` |

### 1.3 Documentación y convenciones

- Cabecera de `api/db/postgres/cms_modelo_postgresql.sql` generalizada, con
  su línea de historial (nunca se borra el historial previo).
- `CLAUDE.md`: nueva **regla dura de genericidad** en la sección 1 y
  estructura de repo actualizada a `Cms.*`.
- Se corrigió de paso el puerto de la API en `launchSettings.json`
  (5144 → **5080**, alineado con los `.env` del frontend).

### 1.4 Repositorio unificado

- `git init` en la raíz (rama `main`); se eliminó el repo git interno de
  `web/` (solo tenía el commit inicial de create-next-app).
- `.gitignore` raíz: excluye `bin/`, `obj/`, `.vs/`, `*.user` y
  `appsettings.Development.json` (credenciales locales).
- Quedan versionadas las plantillas `web/.env.example` y
  `api/src/Cms.Api/appsettings.Development.example.json`; en un clon nuevo se
  copian sin el sufijo `.example` y se ajustan.
- Commit inicial: `ed9b443` (57 archivos).

## 2. Decisiones tomadas

- **Nombre genérico `Cms.*`** para los proyectos .NET (el futuro acceso a ERP
  será `Cms.Erp`).
- **La marca es configuración, no código**: cualquier retail nuevo se monta
  cambiando `web/.env.local` y el contenido del CMS, sin tocar componentes.
- La **BD local sigue llamándose `tubazar_cms`**: el nombre de la base es
  configuración de la instancia (viene en la cadena de conexión `CmsDb`), no
  parte del producto; otra instancia usará su propia BD.
- "TuBazar" puede seguir apareciendo en: configuración (`.env.local`), datos
  del CMS, documentación de la instancia (`docs/propuesta-tubazar.html`) y
  comentarios como ejemplo. En ningún otro lugar.

## 3. Cómo probarlo en local

1. Visual Studio: abrir `api/Cms.sln` y ejecutar (perfil http o https; la API
   escucha en `http://localhost:5080`, el perfil https además en
   `https://localhost:7037`).
2. `cd web && npm run dev` → `http://localhost:3000` debe verse **idéntico a
   antes del cambio**: wordmark "TuBazar" con "Bazar" en color, topbar y
   título del navegador con la marca desde el `.env`.
3. Prueba de genericidad: cambiar `NEXT_PUBLIC_SITE_NAME` en `.env.local`,
   reiniciar `npm run dev` y verificar que todo el sitio muestra el nuevo
   nombre sin tocar código.

Verificado el 17/07/2026: compilación .NET limpia, typecheck de TypeScript
sin errores, API respondiendo (`/health`, menú, página `inicio`) y sitio
renderizando con la marca tomada del entorno.

## 4. Pendientes conocidos

- Los colores del tema (rojo/amarillo/verde BCE en Tailwind, sección 7 del
  `CLAUDE.md`) y las tipografías siguen fijos en `globals.css`: si otra
  instancia necesita su propia paleta, habrá que llevar los tokens a
  configuración (tema por instancia).
- El favicon y los assets de `web/public/` son aún los de por defecto de
  Next.js; al ponerlos, deben ser por instancia.
- Textos como "Todos los derechos reservados" o el mensaje de portada vacía
  siguen en código (aceptable: no son marca), pero si se requiere
  multi-idioma habrá que externalizarlos.
