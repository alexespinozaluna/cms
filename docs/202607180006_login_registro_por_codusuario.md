# 202607180006 — Identificación por CodUsuario (CIP) y reglas de botones

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Cambio de reglas: login y registro se identifican por **CodUsuario = el CIP**
(`Anexo.CodAnexo`). Se elimina el DNI y el selector DNI/CIP. Se agregan reglas
de UI para los botones Verificar y Crear cuenta.

## 1. Reglas (CLAUDE.md §5)

- **CodUsuario = CIP**. Longitud: **9 dígitos** (militares/trabajadores) o
  **6 dígitos** (proveedores/concesionarios). Validación `^(\d{6}|\d{9})$`.
  Ya no se usa el DNI para identificar; el ERP se consulta por `CodAnexo`.
- **Verificar se bloquea** una vez validado el CodUsuario.
- **Crear cuenta permanece inactivo** hasta que los campos requeridos (correo,
  contraseña) sean válidos y el CodUsuario esté verificado; además no se puede
  presionar dos veces (anti doble-envío ya existente).

## 2. Backend

- **DTOs**: `VerificarDocumentoRequest`/`RegistroRequest` usan `CodUsuario`
  (regex 6 o 9 dígitos); se quita el parámetro `Tipo`. `LoginRequest` pasa de
  `Usuario` a `CodUsuario`.
- **`AuthController`**: siempre busca por CIP (`TipoDocumentoBusqueda.Cip`);
  login localiza al usuario por `Cip == CodUsuario`. El SP genérico
  (`spWebAnexoBuscarPorDocumento @Tipo`) se sigue usando con `@Tipo = 2` (CIP).
- **Stub** de ERP: acepta 9 dígitos (militar → Cliente; 7 final → +Trabajador)
  o 6 dígitos (proveedor → Proveedor; impar final → +Concesionario).
- Sin cambios de esquema/migración.

## 3. Frontend

- **`lib/auth.ts`**: `codUsuario` (6/9 dígitos) en `registroSchema` y
  `loginSchema`; `verificarDocumento(codUsuario)`; payload de registro con
  `codUsuario`.
- **Registro** (`app/(auth)/registro`): sin selector; campo "Código de usuario
  (CIP)". El botón **Verificar** queda deshabilitado tras validar (muestra
  "Verificado"). El botón **Crear cuenta** usa `mode:'onChange'` + `isValid`,
  así que solo se activa con los requeridos llenos y el CodUsuario verificado.
- **Login** (`app/(auth)/login`): campo "Código de usuario (CIP)".

## 4. Cómo se probó

Verificado el 18/07/2026 (stub): verificar 9 dígitos → Cliente; 6 dígitos
`123457` → Proveedor+Concesionario; 8 dígitos → 400 (ya no válido); registro 6
dígitos → 201; login por CodUsuario → 200. `tsc` y `npm run build` sin errores.

## 5. Pendientes

- Probar con CodUsuario reales de 6 dígitos (proveedor/concesionario) contra el
  ERP, además de los de 9 (militar/trabajador).
- Manejo del ERP caído con 503 limpio (hoy 500) — pendiente aparte.
