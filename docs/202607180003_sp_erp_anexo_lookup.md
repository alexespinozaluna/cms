# 202607180003 — SP de solo lectura del ERP para el login (Anexo)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** código listo; **falta ejecutar el SP en el ERP** (lo corre el usuario)

Encapsula la consulta de identidad/roles del portal en un **stored procedure de
solo lectura** en el ERP, en vez de un `SELECT` embebido en la API. Cumple la
regla "ERP intocable": el portal solo consume SPs/vistas creadas para él.

## 1. Qué se hizo

- **Nuevo script** `api/db/mssql/spWebAnexoBuscarPorDocumento.sql`:
  procedimiento `dbo.spWebAnexoBuscarPorDocumento @Documento` que devuelve 0/1
  fila con `IdAnexo, Cip, Nombre, Direccion, TipoDocumento, NroDni, Ruc` y los
  flags `EsCliente/EsProveedor/EsConcesionario/EsTrabajador`, solo para personas
  activas y con algún rol. Sigue el estándar T-SQL del autor (cabecera en
  español, prefijo `sp`, `IF OBJECT_ID ... DROP` + `CREATE`).
- **`ConsultaPersonasErpSql`** ahora llama al SP (Dapper,
  `CommandType.StoredProcedure`) en lugar del SQL embebido.

## 2. Convención (importante)

- **Todo script de SQL Server va a `api/db/mssql/` y lo ejecuta el usuario
  manualmente.** Claude nunca ejecuta cambios directos contra el ERP.

## 3. Cómo aplicarlo (manual, en el ERP)

1. Ejecutar `api/db/mssql/spWebAnexoBuscarPorDocumento.sql` en la BD del ERP
   (`BCEData`).
2. Con `ConnectionStrings:ErpDb` configurada, la API usa el SP automáticamente.
3. Probar registro/login con un CIP o DNI real que exista en `Anexo`.

Compilación de la solución verificada (0 errores). La ejecución real contra el
ERP queda pendiente de correr el SP.

## 4. Pendientes conocidos

- **Ejecutar el SP** en el ERP y probar el login con datos reales; ajustar
  nombres de columna si difieren del script de permisos original.
- Evaluar mover el SP a un esquema propio del portal (p. ej. `web`) en lugar de
  `dbo`, si se quiere aislar mejor los objetos del portal.
