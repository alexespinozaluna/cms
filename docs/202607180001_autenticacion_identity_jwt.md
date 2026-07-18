# 202607180001 — Autenticación base (ASP.NET Identity + JWT) y pantallas

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado
(rediseñado el mismo día — ver `202607180002_login_unico_roles_erp.md`)

Paso 3 del roadmap: base de autenticación con ASP.NET Identity + JWT, registro
de cliente validado contra el ERP y las pantallas en Next.js.

## 1. Decisión de arquitectura (CLAUDE.md §4)

ASP.NET Identity requerido, pero EF Core estaba descartado para los dominios de
datos. Se resolvió: **EF Core solo para Identity**, acotado a `Cms.Auth` y sus
tablas, en el esquema `auth` del mismo PostgreSQL. CMS y ERP siguen en Dapper.

## 2. Qué se hizo

- **`Cms.Erp`**: `IValidadorClientesErp.ValidarPorDocumentoAsync(cipDni)` →
  `ClienteErp?`, con un stub de desarrollo (acepta 8-9 dígitos, devuelve un
  código de cliente simulado).
- **`Cms.Auth`** (EF Core + Identity + JWT): `Usuario : IdentityUser`,
  roles `Cliente/Proveedor/Editor/Admin`, `AuthDbContext` (esquema `auth`),
  `GeneradorJwt`, `AddDominioAuth` + `PrepararAuthAsync` (migraciones + roles al
  arranque), migración `IdentityInicial`, `DesignTimeAuthDbContextFactory`.
- **API** `AuthController` (`/api/auth`): `registro-cliente` (valida CIP/DNI vs
  ERP → crea usuario rol Cliente → JWT), `login` (email + contraseña → JWT),
  `yo` (`[Authorize]`).
- **Frontend** (`web/`): `lib/auth.ts` (cliente + esquemas zod espejo del
  backend + sesión en `localStorage`/cookie `tb_sesion`), pantallas
  `app/(auth)/login|registro|recuperar`, componentes `AuthShell`/`CampoTexto`,
  y `SesionAcciones` en el header. Librerías: react-hook-form + zod.
- Config `Jwt` (Issuer/Audience/Key/MinutosVigencia); clave en
  `appsettings.Development.json` (gitignored), plantilla en el `.example`.

## 3. Cómo se probó

Verificado el 18/07/2026: registro 201, email duplicado 400, documento inválido
400, login 200 con `roles:[Cliente]`, contraseña incorrecta 401, `/yo` 200/401.
Tablas de Identity creadas en el esquema `auth`. Build y typecheck del frontend
sin errores; las tres pantallas renderizan.

## 4. Nota

El mismo 18/07/2026 este diseño se **rediseñó a un login único** con roles
derivados de los flags del ERP (Anexo). Los cambios sobre lo aquí descrito
están en `202607180002_login_unico_roles_erp.md`.
