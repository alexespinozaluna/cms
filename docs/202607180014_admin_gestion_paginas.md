# 202607180014 — Editor CMS Fase 1: gestión de páginas

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Panel `/admin` para gestionar las páginas del CMS (CRUD + estado + vigencia).

## 1. Backend (Cms.Content, Dapper)

- **`AdminPaginasRepository`** (Dapper sobre `paginas`): listar, obtener, crear,
  actualizar, cambiar estado, eliminar; `SlugsReservados` (registro, login,
  recuperar, portal, cliente, proveedor, admin, api) y estados válidos.
- **`AdminPaginasController`** (`/api/admin/paginas`,
  `[Authorize(Roles=Editor,Admin)]`): GET lista/{id}, POST, PUT, PATCH
  /{id}/estado, DELETE. Valida slug (formato/reservado/único), vigencia y estado.
  DELETE con datos asociados → 409 (mejor archivar).

## 2. Frontend

- **`AdminShell`**: guarda de rol (Editor/Admin; si no, redirige) + chrome propio
  del panel (overlay a pantalla completa sobre el header público).
- **`/admin/paginas`**: listado con estado (badge), fecha, y acciones (editar,
  publicar, archivar, eliminar).
- **`FormularioPagina`** + `/admin/paginas/nueva` y `/admin/paginas/[id]`:
  crear/editar (slug, título, plantilla, estado, SEO, vigencia) con
  react-hook-form + zod (espejo del backend).
- **`lib/admin-api.ts`**: cliente autenticado (Bearer) de los endpoints admin.
- `proxy.ts` ya protege `/admin/**`.

## 3. Cómo se probó

Verificado el 18/07/2026: `/admin/paginas` sin sesión → 307 a login; con sesión
→ 200; API admin con token de `admin_web1` → 200 (listar); crear → 201; slug
reservado → 400; slug duplicado → 409. Build y typecheck sin errores.

## 4. Pendiente

- Fase 2: editor de bloques (metadata-driven, formularios dinámicos).
- Restructurar layouts para que `/admin` no dependa del overlay (hoy se monta
  sobre el header público con `fixed inset-0`).
