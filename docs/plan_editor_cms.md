# Plan de ejecución — Editor de CMS (panel /admin)

**Objetivo:** panel `/admin` donde los roles **Editor/Admin** gestionan el
contenido del CMS (páginas, bloques, menú), con formularios de bloque
**generados dinámicamente** desde `tipos_bloque.esquema_campos` (metadata-driven).

**Admin principal:** `admin_web1` — **cuenta interna** (no existe en el ERP),
rol **Admin**, sembrada desde configuración.

**Convención:** cada paso se entrega con su commit y su documento datado
`docs/yyyymmdd####_...md`. Backend en Dapper sobre PostgreSQL (el CMS);
autorización con `[Authorize(Roles=...)]`; el ERP no interviene aquí.

---

## Fase 0 — Acceso admin (fundamentos)

**Paso 0.1 — Cuentas internas en el login.**
Hoy el login exige existir en el ERP; los roles Editor/Admin son internos.
- Backend: si el usuario **no** está vinculado al ERP (`IdUserRef` null), el
  login NO llama al ERP; entra con sus roles internos. Si está vinculado, sigue
  sincronizando roles del ERP (y conservando los internos). Sin ningún rol → 403.
- Frontend: relajar el campo **Usuario** del login para aceptar usuarios no
  numéricos (hoy exige 6/9 dígitos). El registro sigue exigiendo CodUsuario 6/9.

**Paso 0.2 — Sembrar `admin_web1`.**
- Al arrancar la API, crear (si no existe) la cuenta interna `admin_web1`
  (UserName/CodUsuario = `admin_web1`, `IdUserRef` = null, rol Admin) con
  correo y **contraseña temporal** desde `appsettings.Development.json`
  (gitignored; plantilla en `.example`). Marcar `CambioPasswordPendiente`.

**Paso 0.3 — Guard de `/admin`.**
- `proxy.ts`: proteger `/admin/**` (cookie de sesión) y, en la página, verificar
  rol Editor/Admin (si no, redirige a `/`). Endpoints admin con
  `[Authorize(Roles=Editor,Admin)]`.

## Fase 1 — Gestión de páginas

**Paso 1.1 — API admin de páginas** (`Cms.Content`, Dapper):
`GET /api/admin/paginas` (lista), `GET /{id}`, `POST` (crear), `PUT /{id}`
(editar), `DELETE /{id}` (archivar). Valida **slug reservado** y unicidad.
Campos: slug, título, plantilla, estado, vigencia_desde/hasta, descripción_seo.

**Paso 1.2 — UI `/admin`**: layout del panel, listado de páginas (estado,
vigencia), y formulario crear/editar con react-hook-form + zod.

## Fase 2 — Editor de bloques (metadata-driven, el corazón)

**Paso 2.1 — API admin de tipos_bloque y bloques**:
`GET /api/admin/tipos-bloque` (esquemas), y por página: listar/crear/editar
(`contenido` JSONB)/reordenar/eliminar bloques, con estado y vigencia.
**Validación del `contenido` contra `esquema_campos`** al guardar.

**Paso 2.2 — UI editor de bloques**: por página, lista ordenable de bloques;
**formulario dinámico** que se arma leyendo `esquema_campos` (tipos: texto,
textolargo, opción, decimal, imagen, fecha, lista de sub-campos…). Vista previa.

## Fase 3 — Menú

**Paso 3.1** — API CRUD de `menu_items` (etiqueta, url, tipo, orden, padre_id,
estado, vigencia) + **Paso 3.2** UI de gestión del menú.

## Fase 4 — Usuarios y roles

**Paso 4.1** — API/UI para que un Admin asigne Editor/Admin a otros usuarios y
cree cuentas internas adicionales (además de `admin_web1`).

## Fase 5 — Extras (posteriores)

- Bloque `form` (formularios dinámicos) + bandeja de respuestas.
- Subida de imágenes a `/media` desde el editor.
- Exportaciones (ClosedXML/QuestPDF) donde apliquen.

---

## Orden sugerido de ejecución

0.1 → 0.2 → 0.3 → 1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.2 → 4.1 → (Fase 5)

Cada paso: implementar → verificar (build/typecheck + prueba de humo) →
commit + doc datado (sin push).
