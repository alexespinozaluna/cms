# 202607180005 — Registro: selector DNI/CIP, SP genérico y anti-duplicado

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)
· **SP a ejecutar en el ERP:** sí (ver §4)

Mejoras al registro: elegir tipo de documento (DNI/CIP), SP del ERP genérico
por `@Tipo` (DRY), verificación previa que autocompleta el nombre, y prevención
de cuentas duplicadas por doble clic (front y back).

## 1. Reglas nuevas en CLAUDE.md

- **§9 (T-SQL)**: procedimientos genéricos/parametrizables (DRY/SOLID); scripts
  de SQL Server en `api/db/mssql/`, ejecutados por el usuario.
- **§9 (C#/TS)**: formularios que crean/registran deben deshabilitar el botón
  tras el primer clic y el backend debe garantizar unicidad (sin duplicados).
- **§5 (Registro)**: selector DNI/CIP + validación (existe en ERP y no
  registrado) + autocompletar nombre; botón "Crear" no se presiona dos veces.

## 2. Backend

- **`Cms.Erp`**: `TipoDocumentoBusqueda` (Ambos=0, Dni=1, Cip=2);
  `IConsultaPersonasErp.BuscarPorDocumentoAsync(documento, tipo)`. La impl real
  pasa `@Tipo` al SP; el stub valida formato (el tipo no altera el stub).
- **`Cms.Auth`**: `Usuario.IdAnexo` ahora es `int?` con **índice único**
  (migración `IdAnexoUnicoNullable`). Los NULL (usuarios internos Editor/Admin)
  coexisten; una persona del ERP no puede tener dos cuentas.
- **`AuthController`**:
  - `POST /verificar-documento` `{documento, tipo}`: valida existencia en ERP
    (422) y no-registrado (409); si ok, devuelve `{nombre, roles}` para
    autocompletar. Regla centralizada (`ResolverPersonaDisponibleAsync`, DRY)
    reutilizada por registro.
  - `POST /registro`: mismo control + creación; ante doble envío que pase la
    verificación, el índice único (Identity/UserName o IdAnexo) responde **409**
    (captura `DuplicateUserName` y `DbUpdateException`).

## 3. Frontend

- **`web/lib/auth.ts`**: `verificarDocumento(documento, tipo)`, `registrar`
  (payload con `tipo` numérico), esquema con `tipo` (DNI/CIP).
- **Registro en dos fases** (`app/(auth)/registro`): (1) selector Tipo + número
  + "Verificar"; (2) al verificar, muestra el titular (nombre + roles) y recién
  habilita correo/teléfono/contraseña + "Crear cuenta". Cambiar tipo/documento
  obliga a re-verificar.
- **Anti doble-clic**: el botón "Crear" se deshabilita con `isSubmitting` y hay
  una guarda por `ref` para el envío concurrente.

## 4. Ejecutar en el ERP (manual)

Re-ejecutar `api/db/mssql/spWebAnexoBuscarPorDocumento.sql` (ahora con `@Tipo`).

## 5. Cómo se probó

Verificado el 18/07/2026 (stub determinista): verificar-documento 200 con
nombre/roles, registro 201, re-verificar 409, documento inválido 400, y una
**carrera de doble clic** (2 registros simultáneos) → uno 201, otro 409 y **una
sola cuenta** creada. `tsc` y `npm run build` sin errores.

## 6. Pendientes conocidos

- Probar el `@Tipo` contra el ERP real (DNI vs CIP) tras re-ejecutar el SP.
- Opcional: manejar el ERP caído con un 503 limpio (hoy 500) — pendiente aparte.
