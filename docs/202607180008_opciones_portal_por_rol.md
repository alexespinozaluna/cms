# 202607180008 — Opciones del portal por rol (matriz)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** estructura completada (18/07/2026); datos pendientes de SP

Se define el modelo de opciones del portal como **opción → roles que la ven**
(el usuario ve la unión de las opciones de sus roles), reemplazando el modelo
anterior de secciones por rol.

## 1. Matriz (CLAUDE.md §5)

| Opción | Roles que la ven |
|---|---|
| Estado de cuenta | Cliente |
| Mis compras | Cliente, Proveedor, Trabajador |
| Mis facturas | Proveedor |
| Boleta de pago | Trabajador |
| Liquidación de pagos | Concesionario |

## 2. Qué se hizo

- **`web/lib/portal.ts`**: `OpcionPortal` con `clave` (slug futuro),
  `titulo`, `descripcion`, `roles[]`, `href?`, `disponible`. `opcionesParaRoles`
  devuelve la unión de opciones para los roles del usuario.
- **`web/app/portal/page.tsx`**: grilla única con las opciones visibles del
  usuario (chips de roles arriba). Cada opción es "Próximamente" hasta tener su
  vista/SP; cuando `disponible` y con `href`, se vuelve enlace.
- **CLAUDE.md §5**: matriz + regla de que cada vista se protege con
  `[Authorize(Roles=...)]` y toma el `IdUserRef` del token; datos desde SPs de
  solo lectura del ERP; listas con TanStack Table.

## 3. Cómo se probó

`tsc` y `npm run build` sin errores; `/portal` compila y lista las opciones
según los roles de la sesión (filtrado client-side desde `localStorage`).

## 4. Pendientes (siguiente: datos reales por opción)

Falta, por cada opción, su **SP de solo lectura** en `api/db/mssql/` (esquema del
ERP a definir con el usuario), el **endpoint protegido** por rol y la **vista**
con TanStack Table:
- Estado de cuenta (Cliente), Mis compras (Cliente/Proveedor/Trabajador),
  Mis facturas (Proveedor), Boleta de pago (Trabajador), Liquidación de pagos
  (Concesionario).
