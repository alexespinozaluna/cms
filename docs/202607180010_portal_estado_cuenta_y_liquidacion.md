# 202607180010 — Portal: Estado de cuenta y Liquidación de pagos

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado con stub (18/07/2026)
· **SPs a ejecutar en el ERP:** sí (`spWebEstadoCuenta`, `spWebLiquidacionPagos`)

Se replican, con el patrón de "Mis compras", dos vistas más del portal, y se
refactoriza el frontend a un componente genérico (DRY).

## 1. Backend

- **SPs** (en `api/db/mssql/`, los ejecuta el usuario):
  - `spWebEstadoCuenta` (Cliente): `DocumentoCC`, familia `CC`, por `IdAnexo`.
  - `spWebLiquidacionPagos` (Concesionario): `DocumentoVA`, por `IdAnexo`.
    **Seguridad**: el filtro por `IdAnexo` (que en el script de origen venía
    comentado) se aplica SIEMPRE; el header pide confirmar el nombre de la
    columna de vínculo en `DocumentoVA`.
- **`IConsultaDocumentosErp`**: `EstadoCuentaAsync` y `LiquidacionPagosAsync`.
  Impl real (SP) con un helper común (DRY); stub con datos de muestra.
- **`PortalController`**: `GET /api/portal/estado-cuenta`
  `[Authorize(Roles=Cliente)]` y `GET /api/portal/liquidacion-pagos`
  `[Authorize(Roles=Concesionario)]`. Helper `Movimientos(...)` común: toma el
  `IdAnexo` del token, normaliza el rango y consulta.

## 2. Frontend

- **`components/portal/VistaMovimientos`**: vista transaccional **genérica**
  (guarda de rol + rango de fechas + `TablaMovimientos`), parametrizada por
  título, ruta, roles permitidos y fetcher. Las tres páginas (Mis compras,
  Estado de cuenta, Liquidación de pagos) son envoltorios delgados.
- **`lib/portal-api.ts`**: `obtenerEstadoCuenta`, `obtenerLiquidacionPagos`.
- **`lib/portal.ts`**: opciones "Estado de cuenta" y "Liquidación de pagos"
  habilitadas (dejan de ser "Próximamente").

## 3. Cómo se probó

Verificado el 18/07/2026 (stub) la **autorización por rol**:
- Cliente → estado-cuenta 200, mis-compras 200, liquidacion-pagos **403**.
- Concesionario (+Proveedor) → liquidacion-pagos 200, estado-cuenta **403**,
  mis-compras 200.

`tsc` y `npm run build` sin errores. Limpieza puntual por `CodUsuario`.

## 4. Para el ERP real (manual)

Ejecutar `spWebEstadoCuenta.sql` y `spWebLiquidacionPagos.sql` en `BCEData`.
Confirmar en `spWebLiquidacionPagos` la columna de vínculo del concesionario.

## 5. Pendientes

- **Mis facturas** (Proveedor) y **Boleta de pago** (Trabajador): falta el
  origen en el ERP (tablas/consulta).
- Formato de montos por moneda/estado; totales/resumen; paginación si crece.
- Manejo del ERP caído con 503 limpio (hoy 500) — pendiente aparte.
