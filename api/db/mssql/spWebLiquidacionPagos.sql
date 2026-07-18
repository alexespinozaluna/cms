
IF OBJECT_ID('dbo.spWebLiquidacionPagos', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebLiquidacionPagos;
GO
-- ============================================================================
-- Descripción breve : Liquidación de pagos del portal para un concesionario:
--                     documentos DocumentoVA en un rango de fechas.
--                     SOLO LECTURA; objeto creado para el portal (ERP intocable).
-- Input             : @IdAnexo   INT       -- IdAnexo del titular (del token)
--                     @FechaIni  DATETIME
--                     @FechaFin  DATETIME
-- Output            : IdDocumento, TipoDoc, FechaEmision, NroSerieDoc,
--                     NomFormaVenta (NULL), NomEstado, EsInverso, Total, Pagado,
--                     Saldo, Referencia (tipo de documento referenciado).
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Portal — vista "Liquidación de pagos" (Concesionario).
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial (basada en Consultas-Cliente_
--                              proveedor-concesionario.sql).
--
-- IMPORTANTE (seguridad): el concesionario SOLO debe ver SUS documentos. En el
-- script de origen el filtro por IdAnexo venía comentado; aquí se aplica
-- @IdAnexo. CONFIRMAR que la columna de vínculo en DocumentoVA sea
-- IdAnexo_ClienteProveedor; si es otra, corregirla (NO dejar el filtro fuera).
-- ============================================================================
CREATE PROCEDURE dbo.spWebLiquidacionPagos
    @IdAnexo  INT,
    @FechaIni DATETIME,
    @FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.IdDocumento,
        ISNULL(dt.NomDocumentoTipoCorto, dt.NomDocumentoTipo)   AS TipoDoc,
        d.FechaEmision,
        CONCAT(dt.CodDocumentoTipo, '-', d.CodDocumento)        AS NroSerieDoc,
        CAST(NULL AS VARCHAR(100))                             AS NomFormaVenta,
        e.NomEstado,
        dt.EsInverso,
        d.Total          * IIF(dt.EsInverso = 1, -1, 1)         AS Total,
        d.MontoCancelado * IIF(dt.EsInverso = 1, -1, 1)         AS Pagado,
        (d.Total - d.MontoCancelado) * IIF(dt.EsInverso = 1, -1, 1) AS Saldo,
        ISNULL(dtr.NomDocumentoTipoCorto, dtr.NomDocumentoTipo) AS Referencia
    FROM DocumentoVA d
    INNER JOIN DocumentoTipo dt  ON d.IdDocumentoTipo = dt.IdDocumentoTipo
    INNER JOIN DocumentoTipo dtr ON d.IdDocumentoTipo_Referencia = dtr.IdDocumentoTipo
    INNER JOIN EstadoTD e        ON d.IdEstado = e.IdEstado
    WHERE d.FechaEmision BETWEEN @FechaIni AND @FechaFin
      AND d.IdAnexo_ClienteProveedor = @IdAnexo
    ORDER BY d.FechaEmision DESC, d.IdDocumento DESC;
END
GO
