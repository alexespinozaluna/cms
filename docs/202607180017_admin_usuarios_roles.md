# 202607180017 — Editor CMS Fase 4: usuarios y roles

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Gestión de usuarios y roles internos (Editor/Admin) desde el panel (solo Admin).

## 1. Backend

- **`AdminUsuariosController`** (`/api/admin/usuarios`, `[Authorize(Roles=Admin)]`):
  - `GET`: lista usuarios con usuario, correo, nombre, origen (interno/ERP) y roles.
  - `PUT /{id}/roles-internos`: fija los roles internos (Editor/Admin) del usuario,
    sin tocar los roles derivados del ERP.
  - `POST /interno`: crea una cuenta interna (usuario, correo, contraseña temporal,
    roles) para editores que no son del ERP. `CambioPasswordPendiente = true`.

## 2. Frontend

- **`/admin/usuarios`**: tabla de usuarios con checkboxes Editor/Admin (asigna al
  vuelo) + formulario para crear cuenta interna. Enlace "Usuarios" en la nav,
  visible solo para Admin.

## 3. Cómo se probó

Verificado el 18/07/2026: listar usuarios (incluye `admin_web1` interno y las
cuentas del ERP); crear `editor_prueba` interno → 201; el editor ingresa con
rol Editor, accede a `/api/admin/paginas` (200) pero NO a `/api/admin/usuarios`
(403, solo Admin). Limpieza puntual por `UserName`. `tsc`/`build` OK.

## 4. Estado del editor de CMS (Fases 0–4 completas)

El panel `/admin` es funcional: acceso admin (cuenta interna `admin_web1`),
páginas, bloques metadata-driven, menú y usuarios/roles.

**Pendiente (Fase 5, extras):** bloque `form` (formularios dinámicos) + bandeja
de respuestas, subida de imágenes a `/media` desde el editor, exportaciones
(ClosedXML/QuestPDF). Además: restructurar layouts para que `/admin` no use el
overlay `fixed`, y forzar el cambio de contraseña al primer login.
