# 202607180016 — Editor CMS Fase 3: gestión del menú

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

CRUD del menú del sitio (`menu_items`) desde el panel `/admin`.

## 1. Backend

- **`AdminMenuRepository`** (Dapper): listar, obtener, crear (orden auto por
  nivel), actualizar, reordenar, eliminar.
- **`AdminMenuController`** (`/api/admin/menu`, `[Authorize(Editor,Admin)]`):
  GET, POST, PUT, `PUT /orden`, DELETE. Valida tipo (contenido|sistema) y estado.

## 2. Frontend

- **`/admin/menu`**: lista con reordenar (▲▼), editar y eliminar; formulario
  inline (etiqueta, url, tipo, estado, y padre opcional para submenús).
- Enlace "Menú" en la nav del panel; `admin-api` ampliado.

## 3. Cómo se probó

Verificado el 18/07/2026 (con `admin_web1`): crear ítem → 201; listar lo incluye;
tipo inválido → 400; eliminar → 204; sin token → 401. `tsc`/`build` sin errores.

## 4. Estado del editor de CMS

Completadas las Fases 0–3 (acceso admin, páginas, bloques metadata-driven, menú):
**el editor de contenido del CMS es funcional**. Pendientes (fases opcionales):
- Fase 4: que un Admin asigne Editor/Admin a otros y cree cuentas internas.
- Fase 5: bloque `form` (formularios dinámicos) + respuestas, subida de imágenes
  a `/media` desde el editor, exportaciones. Además: restructurar layouts para
  que `/admin` no use el overlay `fixed`, y cambio de contraseña obligatorio del
  admin al primer login.
