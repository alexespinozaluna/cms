
IF OBJECT_ID('dbo.spWebMisCompras', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebMisCompras;
GO
-- ============================================================================
-- Descripción breve : Movimientos de "Mis compras" del portal para una persona
--                     (cliente/proveedor/trabajador): documentos de compra-venta
--                     (DocumentoCV, familias CV y CCL) en un rango de fechas.
--                     SOLO LECTURA; objeto creado para el portal (ERP intocable).
-- Input             : @IdAnexo   INT       -- IdAnexo del titular (del token)
--                     @FechaIni  DATETIME  -- inicio del rango
--                     @FechaFin  DATETIME  -- fin del rango
-- Output            : IdDocumento, TipoDoc, FechaEmision, NroSerieDoc,
--                     NomFormaVenta, NomEstado, EsInverso, Total, Pagado, Saldo,
--                     Referencia. (Total/Pagado/Saldo con signo según EsInverso.)
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Portal — vista "Mis compras" (paso 4 del roadmap).
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial (basada en Consultas-Cliente_
--                              proveedor-concesionario.sql).
-- ============================================================================
CREATE PROCEDURE dbo.spWebMisCompras
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
      AND dtf.CodDocumentoTipoFamilia IN ('CV', 'CCL')
      AND d.IdAnexo_ClienteProveedor = @IdAnexo
    ORDER BY d.FechaEmision DESC, d.IdDocumento DESC;
END
GO
