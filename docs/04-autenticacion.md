# Proceso 4 — Autenticación (Identity + JWT), login único y roles por ERP

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Paso 3 del roadmap: **un solo login** con ASP.NET Identity + JWT. La persona
debe existir en la tabla `Anexo` del ERP; sus roles (cliente, proveedor,
concesionario, trabajador — combinables) salen de los flags del ERP y las
opciones del usuario logueado se arman según esos roles. Las credenciales
(concepto "AnexoWeb") viven en PostgreSQL; el ERP se consulta solo lectura.

## 1. Decisión de arquitectura (registrada en CLAUDE.md §4)

El `CLAUDE.md` pedía **ASP.NET Identity** pero había descartado **EF Core**.
Se resolvió: **EF Core se usa SOLO para Identity**, acotado al proyecto
`Cms.Auth` y sus tablas, en el esquema `auth` del mismo PostgreSQL. CMS y ERP
siguen 100% en Dapper. Es el store estándar de Identity y evita escribir
stores a mano (opción de menos código).

## 2. Qué se hizo

### 2.1 `Cms.Erp` — acceso al ERP (solo lectura, mockeable)

- `PersonaErp`: `IdAnexo`, `Cip`, `Nombre`, `NroDni`, `Ruc`, y los flags
  `EsCliente/EsProveedor/EsConcesionario/EsTrabajador` (+ `TieneAlgunRol`).
- `IConsultaPersonasErp.BuscarPorDocumentoAsync(cipDni)` → busca por
  `CodAnexo` o `Documento`; devuelve la persona solo si está activa y con algún rol.
- `ConsultaPersonasErpSql`: implementación real (Dapper + `Microsoft.Data.SqlClient`)
  con el **script de permisos del ERP** (Anexo + TipoDocumentoIdentidadSunat).
  Se activa si existe la cadena `ErpDb`.
- `ConsultaPersonasErpStub`: dev sin ERP; deriva los flags del último dígito
  del documento para probar combinaciones de roles.

### 2.2 `Cms.Auth` — identidad (EF Core + Identity + JWT)

- `Usuario : IdentityUser` extendido ("AnexoWeb"): `IdAnexo`, `Cip`, `NroDni`,
  `Telefono`, `NombreCompleto`, `CambioPasswordPendiente`. Login por `UserName`
  = CIP/DNI.
- `Roles`: derivados del ERP (`Cliente`, `Proveedor`, `Concesionario`,
  `Trabajador`) + internos del CMS (`Editor`, `Admin`). `DerivadosErp` marca
  cuáles se sincronizan.
- `AuthDbContext : IdentityDbContext<Usuario>` con esquema `auth`.
- `GeneradorJwt`: token con `sub`, `unique_name`, `email`, roles y claims
  `id_anexo` / `cip`.
- `AddDominioAuth` + `PrepararAuthAsync` (migraciones + roles al arranque).
- Migraciones: `IdentityInicial` + `VinculoAnexoWeb` (esquema `auth`).
- `DesignTimeAuthDbContextFactory`: migraciones con `dotnet ef` sin arrancar
  `Cms.Api` (lee `CMS_AUTH_CS`).

### 2.3 API

- `AuthController` (`/api/auth`):
  - `POST /registro`: valida la persona en el ERP (existe + algún rol) → crea
    la cuenta web y asigna los roles derivados → JWT (201). Sin rol en ERP →
    422; cuenta ya existente → 409.
  - `POST /login`: usuario (CIP/DNI) + contraseña → valida en Postgres, relee
    los flags del ERP y **sincroniza roles** → JWT (200) o 401; sin acceso en
    ERP → 403.
  - `GET /yo` (`[Authorize]`): usuario, `id_anexo`, `cip`, roles.
- DTOs con DataAnnotations (validación backend obligatoria).
- `Program.cs`: `AddDominioAuth` + `AddDominioErp`, `UseAuthentication/
  UseAuthorization`, migraciones + roles al arranque.
- Config `Jwt` (Issuer, Audience, Key, MinutosVigencia). La clave real vive en
  `appsettings.Development.json` (gitignored); plantilla en el `.example`.

## 3. Cómo probarlo en local

Requisitos: PostgreSQL con la BD `tubazar_cms`. Las migraciones se aplican
solas al arrancar la API; para hacerlo a mano:

```
export CMS_AUTH_CS='Host=localhost;Port=5432;Database=tubazar_cms;Username=postgres;Password=...'
dotnet ef database update -p src/Cms.Auth -s src/Cms.Auth
```

El ERP: sin `ErpDb` configurada se usa el **stub** (deriva roles del último
dígito: base Cliente, par → +Proveedor, 7 → +Trabajador, 9 → +Concesionario).
Para el ERP real, definir `ConnectionStrings:ErpDb` en
`appsettings.Development.json`.

Flujo (con la API en `http://localhost:5080`):

1. `POST /api/auth/registro` `{documento, correo, telefono?, password, nombreCompleto?}`
   → 201 + token con los roles derivados; sin rol en ERP → 422; duplicado → 409.
2. `POST /api/auth/login` `{usuario (CIP/DNI), password}` → 200 + token; 401 si falla.
3. `GET /api/auth/yo` con `Authorization: Bearer <token>` → 200; sin token → 401.

Verificado el 18/07/2026: registro con combinaciones de roles
(Cliente+Proveedor, +Concesionario, +Trabajador), duplicado 409, login por
CIP y por DNI, contraseña incorrecta 401, `/yo` con `id_anexo`/`cip`/roles, y
preflight CORS + registro/login cross-origin desde `localhost:3000`.

## 4. Pantallas de auth en Next.js (18/07/2026)

- Librerías: `react-hook-form` + `zod` + `@hookform/resolvers` (CLAUDE.md §4).
- `web/lib/auth.ts`: cliente de la API (`registrar`, `login`), esquemas zod que
  **espejan la validación del backend** y manejo de sesión en el navegador
  (`localStorage` + cookie `tb_sesion` legible para futuros guards).
- Pantallas (grupo `app/(auth)/`): `login` (por CIP/DNI), `registro` (único,
  con verificación CIP/DNI vía la API), `recuperar` (placeholder). Componentes
  `AuthShell` y `CampoTexto` reutilizables.
- `SesionAcciones` en el header: "Iniciar sesión" o el nombre/usuario + "Salir".
- Los CTA de la banda de portales apuntan a `/login` (login único).
- `web/lib/content-api.ts`: `obtenerPagina` se hizo resiliente (si la Content
  API no responde, cae a fallback en vez de romper el build).

## 5. Pendientes conocidos

- **ERP real**: falta la cadena `ErpDb` (SQL Server `192.168.0.15`) para usar
  `ConsultaPersonasErpSql`; la query ya está escrita (script de permisos).
  Ideal: envolverla en un SP/vista de solo lectura dedicada al portal.
- **Opciones del usuario logueado**: definir qué ve cada rol (cliente,
  proveedor, concesionario, trabajador) tras entrar — dashboards por rol.
- **Recuperación de contraseña por correo** y **confirmación de email**: hoy
  `RequireConfirmedEmail=false`; `/recuperar` es placeholder (requiere correo).
- **Autorización por rol y guards de ruta**: `[Authorize(Roles=...)]` en la API
  y protección de rutas en Next.js (la cookie `tb_sesion` permite un middleware).
