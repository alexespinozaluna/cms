# 202607180009 — Portal: vista "Mis compras" (primer slice con datos del ERP)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado con stub (18/07/2026)
· **SP a ejecutar en el ERP:** sí (`spWebMisCompras`)

Primera vista transaccional del portal con datos del ERP. Establece el patrón
reutilizable (SP → Cms.Erp → endpoint protegido por rol → TanStack Table) para
las demás opciones.

## 1. Backend

- **SP** `api/db/mssql/spWebMisCompras.sql` (`@IdAnexo, @FechaIni, @FechaFin`):
  documentos de compra-venta (`DocumentoCV`, familias `CV`/`CCL`) del titular,
  basado en tu `Consultas-Cliente_proveedor-concesionario.sql`. Solo lectura.
- **`Cms.Erp/Documentos`**: `MovimientoErp` (forma común: TipoDoc, FechaEmision,
  NroSerieDoc, FormaVenta, Estado, EsInverso, Total, Pagado, Saldo, Referencia),
  `IConsultaDocumentosErp.MisComprasAsync`, impl real (SP) y stub de muestra.
  Registro en `AddDominioErp` (real si hay `ErpDb`, si no stub).
- **`PortalController`** `GET /api/portal/mis-compras?desde&hasta`
  `[Authorize(Roles=Cliente,Proveedor,Trabajador)]`. Toma el `IdAnexo` del claim
  `id_user_ref` del token (**nunca** de un parámetro del cliente). Rango por
  defecto: últimos 2 meses. Roles de la matriz en `Roles.Ven.*`.

## 2. Frontend

- **`lib/portal-api.ts`**: `obtenerMisCompras(desde, hasta)` con `Authorization:
  Bearer <token>` de la sesión; tipo `Movimiento`.
- **`components/portal/TablaMovimientos`**: tabla transaccional reutilizable con
  **TanStack Table** (fecha, tipo, comprobante, forma, estado, total, pagado,
  saldo, referencia), scroll horizontal en móvil.
- **`app/portal/mis-compras`**: vista con filtro de fechas y guarda de rol
  (redirige a `/portal` si el rol no aplica; a `/login` si no hay sesión).
- La opción "Mis compras" del `/portal` deja de ser "Próximamente".

## 3. Cómo se probó

Verificado el 18/07/2026 (stub): registro Cliente → token; `GET
/api/portal/mis-compras` con token → 200 con filas de muestra; sin token → 401.
`tsc` y `npm run build` sin errores. Limpieza de prueba puntual (solo la fila
propia por `CodUsuario`).

## 4. Para el ERP real (manual)

Ejecutar `api/db/mssql/spWebMisCompras.sql` en `BCEData`. Con `ErpDb` configurada
y el SP creado, la vista trae datos reales (filtrados por el `IdAnexo` del token).

## 5. Pendientes (siguientes vistas, mismo patrón)

- **Estado de cuenta** (Cliente): `DocumentoCC`, familia `CC` (query ya dada).
- **Liquidación de pagos** (Concesionario): `DocumentoVA` (revisar el filtro por
  IdAnexo, que en el script venía comentado).
- **Mis facturas** (Proveedor) y **Boleta de pago** (Trabajador): falta definir
  su origen en el ERP.
- Formato de montos con moneda y estilo por saldo/estado; paginación si hace falta.
