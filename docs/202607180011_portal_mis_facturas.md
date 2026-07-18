# 202607180011 — Portal: vista "Mis facturas" (Proveedor)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** circuito completo con stub (18/07/2026); **SP a confirmar**

Cuarta opción del portal, con el patrón ya establecido. El origen exacto de las
facturas del proveedor está **por confirmar** (no venía en el script del ERP).

## 1. Backend

- **SP** `api/db/mssql/spWebMisFacturas.sql`: **punto de partida** basado en
  `DocumentoCV` filtrado por el `IdAnexo` del proveedor. El header marca que hay
  que **AJUSTAR la tabla/familia** si las facturas del proveedor salen de otro
  origen; el filtro por `@IdAnexo` se mantiene siempre.
- **`IConsultaDocumentosErp.MisFacturasAsync`** (real vía SP + stub).
- **`PortalController`** `GET /api/portal/mis-facturas`
  `[Authorize(Roles=Proveedor)]` (helper común, `IdAnexo` del token).

## 2. Frontend

- **`lib/portal-api.ts`**: `obtenerMisFacturas`.
- **`app/portal/mis-facturas`**: envoltorio de `VistaMovimientos` (rol Proveedor).
- **`lib/portal.ts`**: opción "Mis facturas" habilitada.

## 3. Cómo se probó

Verificado el 18/07/2026 (stub): Proveedor → `/api/portal/mis-facturas` 200;
Cliente → 403. `tsc` y `npm run build` sin errores. Limpieza puntual por
`CodUsuario`.

## 4. Pendiente clave

- **Confirmar el origen real de "Mis facturas" del proveedor** (tabla y familia
  de documento) y ajustar `spWebMisFacturas.sql`. Hoy usa `DocumentoCV`
  (CV/CCL), igual que "Mis compras"; si para el proveedor deben ser otros
  documentos, se corrige la consulta.
- **Boleta de pago** (Trabajador): queda para el final (por decisión).
