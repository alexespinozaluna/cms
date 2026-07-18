# 202607180002 — Login único con roles derivados de los flags del ERP

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Rediseño de la autenticación de `202607180001_autenticacion_identity_jwt.md`:
un **solo login** para todos los tipos de persona, con los roles derivados de
los flags del ERP (tabla `Anexo`). Reemplaza el registro de cliente con rol fijo.

## 1. Decisión (CLAUDE.md §5)

- **Un login único**. La persona debe existir en `Anexo` (ERP), activa
  (`EsDesactivado=0`) y con al menos un flag de rol. Los roles se combinan:
  `EsCliente`, `EsProveedor`, `EsConcesionario`, `EsTrabajador` (este solo si
  además `EsDomiciliado=1`).
- **Credenciales en PostgreSQL** (concepto "AnexoWeb" = usuario de Identity
  extendido). El ERP NO se escribe: se consulta solo lectura para validar
  existencia y traer flags. `SistemaUsuario` (ERP de escritorio) no se toca.
- Login por **usuario = CIP o DNI** (antes era por correo).

## 2. Qué se hizo (cambios sobre 202607180001)

- **`Cms.Erp`**: se reemplaza `ClienteErp`/`IValidadorClientesErp` por
  `PersonaErp` (con flags + `IdAnexo`, `Cip`, `NroDni`, `Ruc`) e
  `IConsultaPersonasErp.BuscarPorDocumentoAsync` (busca por `CodAnexo` o
  `Documento`; solo activos con algún rol).
  - `ConsultaPersonasErpSql`: implementación real (Dapper + SqlClient) con el
    **script de permisos del ERP** (`Anexo` ⋈ `TipoDocumentoIdentidadSunat`);
    se activa si existe la cadena `ErpDb`.
  - `ConsultaPersonasErpStub`: dev sin ERP (deriva los flags del último dígito).
- **`Cms.Auth`**: `Usuario` pasa a `IdAnexo`, `Cip`, `NroDni`, `Telefono`,
  `NombreCompleto` (se quitan `CodigoClienteErp`/`CodigoProveedor`). Roles nuevos
  `Concesionario` y `Trabajador` (+ `DerivadosErp`). JWT con `unique_name`,
  `id_anexo`, `cip`. Migración `VinculoAnexoWeb`.
- **API** `AuthController`:
  - `POST /registro` (único): valida la persona en el ERP (existe + algún rol)
    → crea la cuenta web y asigna los roles derivados → JWT (201). Sin rol → 422;
    cuenta ya existente → 409.
  - `POST /login`: usuario (CIP/DNI) + contraseña → valida en Postgres, relee
    flags del ERP y **sincroniza roles en vivo** → JWT (200); 401 credenciales;
    403 sin acceso en ERP.
- **Frontend**: login por CIP/DNI, registro único (documento, correo, teléfono,
  contraseña, nombre), `SesionAcciones` muestra nombre/usuario; los CTA de la
  banda de portales apuntan a `/login` (login único). `lib/content-api.ts`:
  `obtenerPagina` se hizo resiliente (si la API no responde, cae a fallback y no
  rompe el build).

## 3. Configuración del ERP

- `ConnectionStrings:ErpDb` en `appsettings.Development.json` (gitignored).
  Vacía → usa el stub. Real: `Server=192.168.0.15;Database=BCEData;User Id=SA;
  Password=***;TrustServerCertificate=True`.
- Recomendado (regla "ERP intocable"): envolver la consulta en un SP/vista de
  solo lectura dedicada al portal en vez de un SELECT directo a `Anexo`.

## 4. Cómo se probó

Verificado el 18/07/2026 (con el stub): registro con combinaciones de roles
(Cliente+Proveedor, +Concesionario, +Trabajador), duplicado 409, login por CIP
y por DNI, contraseña incorrecta 401, `/yo` con `id_anexo`/`cip`/roles, y
**preflight CORS + registro/login cross-origin** desde `localhost:3000`. `tsc` y
`npm run build` sin errores.

## 5. Pendientes conocidos

- **Probar contra el ERP real** ya configurado (`BCEData`): validar que las
  columnas del script (`Anexo`, `TipoDocumentoIdentidadSunat`) coincidan.
- **Opciones/dashboards por rol** del usuario logueado (siguiente paso).
- **Recuperación de contraseña y confirmación por correo** (requiere servicio de
  correo); `/recuperar` es placeholder.
- **Autorización por rol y guards de ruta** (API `[Authorize(Roles=...)]` y
  middleware en Next.js con la cookie `tb_sesion`).
