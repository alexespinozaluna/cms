
IF OBJECT_ID('dbo.spWebMisFacturas', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebMisFacturas;
GO
-- ============================================================================
-- Descripción breve : Facturas del portal para un proveedor, en un rango.
--                     SOLO LECTURA; objeto creado para el portal (ERP intocable).
-- Input             : @IdAnexo   INT       -- IdAnexo del proveedor (del token)
--                     @FechaIni  DATETIME
--                     @FechaFin  DATETIME
-- Output            : IdDocumento, TipoDoc, FechaEmision, NroSerieDoc,
--                     NomFormaVenta, NomEstado, EsInverso, Total, Pagado, Saldo,
--                     Referencia.
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Portal — vista "Mis facturas" (Proveedor).
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial.
--
-- PENDIENTE (confirmar con el negocio): el script de origen NO traía una
-- consulta específica de "Mis facturas". Este SP arranca con DocumentoCV
-- filtrado por el IdAnexo del proveedor; AJUSTAR la tabla/familia si las
-- facturas del proveedor salen de otro lado (p. ej. otra CodDocumentoTipoFamilia
-- o DocumentoCC). Mantener SIEMPRE el filtro por @IdAnexo.
-- ============================================================================
CREATE PROCEDURE dbo.spWebMisFacturas
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
        CONCAT(d.SerieDocumento, '-', d.CodDocumento)           AS NroSerieDoc,
        fv.NomFormaVenta,
        e.NomEstado,
        dt.EsInverso,
        d.Total          * IIF(dt.EsInverso = 1, -1, 1)         AS Total,
        d.MontoCancelado * IIF(dt.EsInverso = 1, -1, 1)         AS Pagado,
        (d.Total - d.MontoCancelado) * IIF(dt.EsInverso = 1, -1, 1) AS Saldo,
        d.Referencia
    FROM DocumentoCV d
    INNER JOIN DocumentoTipo dt        ON d.IdDocumentoTipo = dt.IdDocumentoTipo
    INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia
    INNER JOIN FormaVentaTD fv         ON d.IdFormaVenta = fv.IdFormaVenta
    INNER JOIN EstadoTD e              ON d.IdEstado = e.IdEstado
    WHERE d.FechaEmision BETWEEN @FechaIni AND @FechaFin
      AND dtf.CodDocumentoTipoFamilia IN ('CV', 'CCL')   -- AJUSTAR a la familia de facturas
      AND d.IdAnexo_ClienteProveedor = @IdAnexo
    ORDER BY d.FechaEmision DESC, d.IdDocumento DESC;
END
GO
