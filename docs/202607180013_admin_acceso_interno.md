# 202607180013 — Editor CMS Fase 0: acceso admin (cuentas internas)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Fundamentos de acceso para el panel `/admin`: cuentas internas (Editor/Admin no
del ERP), sembrado del Admin inicial `admin_web1` y guarda de ruta.

## 1. Qué se hizo

- **Login para cuentas internas** (`AuthController.Login`): si el usuario NO está
  vinculado al ERP (`IdUserRef` null), no se llama al ERP; entra con sus roles
  internos. Si está vinculado, sigue sincronizando roles del ERP (conservando
  los internos). Sin ningún rol → 403.
- **Sembrado de `admin_web1`** (`PrepararAuthAsync`): al arrancar crea (si no
  existe) la cuenta interna Admin desde `Cms:AdminInicial` (Usuario/Correo/
  Password en `appsettings.Development.json`, gitignored; plantilla en `.example`),
  con `CambioPasswordPendiente = true`.
- **Frontend**: el campo "Usuario" del login se relaja (acepta CodUsuario 6/9 o
  usuarios internos). `proxy.ts` protege también `/admin/**`.

## 2. Cómo se probó

Verificado el 18/07/2026 (stub): login `admin_web1/Alex1234` → 200 con
`roles:[Admin]`, sin bloqueo del ERP; clave incorrecta → 401; la fila queda con
`IdUserRef` null y `CambioPasswordPendiente = true`. Build/typecheck OK.

## 3. Pendiente (siguientes fases)

- Fase 1: gestión de páginas (API + UI /admin).
- Fase 2: editor de bloques metadata-driven.
- Cambio de contraseña obligatorio al primer login (hoy solo marcado).
