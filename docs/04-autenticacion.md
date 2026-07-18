# Proceso 4 — Autenticación (Identity + JWT) y registro de cliente

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** núcleo completado y verificado (18/07/2026)

Paso 3 del roadmap: base de autenticación con ASP.NET Identity + JWT y el
registro de cliente validado contra el ERP.

## 1. Decisión de arquitectura (registrada en CLAUDE.md §4)

El `CLAUDE.md` pedía **ASP.NET Identity** pero había descartado **EF Core**.
Se resolvió: **EF Core se usa SOLO para Identity**, acotado al proyecto
`Cms.Auth` y sus tablas, en el esquema `auth` del mismo PostgreSQL. CMS y ERP
siguen 100% en Dapper. Es el store estándar de Identity y evita escribir
stores a mano (opción de menos código).

## 2. Qué se hizo

### 2.1 `Cms.Erp` — acceso al ERP (mockeable)

- `IValidadorClientesErp.ValidarPorDocumentoAsync(cipDni)` → `ClienteErp?`.
- `ValidadorClientesErpStub`: implementación de desarrollo **sin ERP**; acepta
  documentos con formato válido (DNI 8 / CIP 9 dígitos) y devuelve un código de
  cliente simulado. **TODO**: reemplazar por el SP real de SQL Server
  (Dapper + `Microsoft.Data.SqlClient`, ya referenciados).

### 2.2 `Cms.Auth` — identidad (EF Core + Identity + JWT)

- `Usuario : IdentityUser` con `CodigoClienteErp`, `CodigoProveedor`,
  `NombreCompleto`, `CambioPasswordPendiente`.
- `Roles`: `Cliente`, `Proveedor`, `Editor`, `Admin`.
- `AuthDbContext : IdentityDbContext<Usuario>` con esquema por defecto `auth`.
- `GeneradorJwt`: emite el token con `sub`, `email`, roles y los claims
  `codigo_cliente_erp` / `codigo_proveedor`.
- `AddDominioAuth(cadena, config)`: registra DbContext (Npgsql), IdentityCore +
  roles + stores EF + token providers, el generador de JWT y la autenticación
  Bearer. `PrepararAuthAsync`: aplica migraciones y crea los roles al arrancar.
- Migración inicial de Identity: `Data/Migraciones` (esquema `auth`).
- `DesignTimeAuthDbContextFactory`: permite generar/aplicar migraciones con
  `dotnet ef` sin arrancar `Cms.Api` (lee la cadena de `CMS_AUTH_CS`).

### 2.3 API

- `AuthController` (`/api/auth`):
  - `POST /registro-cliente`: valida CIP/DNI vs ERP → crea usuario rol Cliente
    → devuelve JWT (201). Documento no válido en ERP → 422.
  - `POST /login`: email + contraseña → JWT (200) o 401.
  - `GET /yo` (`[Authorize]`): claims del usuario autenticado.
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

Flujo (con la API en `http://localhost:5080`):

1. `POST /api/auth/registro-cliente` `{cipDni, email, password}` → 201 + token.
2. `POST /api/auth/login` `{email, password}` → 200 + token con `roles:[Cliente]`.
3. `GET /api/auth/yo` con `Authorization: Bearer <token>` → 200; sin token → 401.

Verificado el 18/07/2026: registro 201, email duplicado 400, documento con
formato inválido 400, login 200, contraseña incorrecta 401, `/yo` 200/401.
Tablas de Identity creadas en el esquema `auth`.

## 4. Pantallas de auth en Next.js (18/07/2026)

- Librerías: `react-hook-form` + `zod` + `@hookform/resolvers` (CLAUDE.md §4).
- `web/lib/auth.ts`: cliente de la API (`registrarCliente`, `login`), esquemas
  zod que **espejan la validación del backend** (CIP/DNI 8-9 dígitos, correo,
  contraseña ≥8 con mayúscula/minúscula/número) y manejo de sesión en el
  navegador (`localStorage` + cookie `tb_sesion` legible para futuros guards).
- Pantallas (grupo de rutas `app/(auth)/`): `login`, `registro` (cliente, con
  validación CIP/DNI vía la API), `recuperar` (placeholder hasta el correo).
  Componentes `AuthShell` y `CampoTexto` reutilizables.
- `SesionAcciones` en el header: muestra "Iniciar sesión" o el correo + "Salir"
  según la sesión (client component, sin parpadeo de hidratación).

Verificado el 18/07/2026: `tsc` y `npm run build` sin errores; las tres
pantallas renderizan sus campos; el wiring cliente→`/api/auth` queda en el
bundle. El flujo real usa la API en `NEXT_PUBLIC_CONTENT_API_URL` (5080).

## 5. Pendientes conocidos

- **SP real del ERP**: hoy el validador es un stub; falta el SP de solo lectura
  en SQL Server y su implementación Dapper.
- **Alta de proveedor** (por Admin, contraseña temporal + cambio obligatorio al
  primer login) y **recuperación de contraseña por correo**: no incluidos en
  esta ronda (requieren el servicio de correo). La pantalla `/recuperar` es un
  placeholder.
- **Confirmación de email**: `RequireConfirmedEmail` está en false hasta tener
  el flujo de correo.
- **Autorización por rol y guards de ruta**: los portales de cliente/proveedor
  y el panel admin aplicarán `[Authorize]` en la API y protección de rutas en
  Next.js (la cookie `tb_sesion` ya permite un middleware de guarda).
