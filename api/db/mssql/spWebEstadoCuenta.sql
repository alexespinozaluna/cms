
IF OBJECT_ID('dbo.spWebEstadoCuenta', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebEstadoCuenta;
GO
-- ============================================================================
-- Descripción breve : Estado de cuenta del portal para un cliente: documentos
--                     de cuenta corriente (DocumentoCC, familia CC) en un rango.
--                     SOLO LECTURA; objeto creado para el portal (ERP intocable).
-- Input             : @IdAnexo   INT       -- IdAnexo del titular (del token)
--                     @FechaIni  DATETIME
--                     @FechaFin  DATETIME
-- Output            : IdDocumento, TipoDoc, FechaEmision, NroSerieDoc,
--                     NomFormaVenta (= forma de pago), NomEstado, EsInverso,
--                     Total, Pagado, Saldo, Referencia (CodOrden).
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Portal — vista "Estado de cuenta" (Cliente).
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial (basada en Consultas-Cliente_
--                              proveedor-concesionario.sql).
-- ============================================================================
CREATE PROCEDURE dbo.spWebEstadoCuenta
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
        fp.NomFormaPago                                         AS NomFormaVenta,
        e.NomEstado,
        dt.EsInverso,
        d.Total          * IIF(dt.EsInverso = 1, -1, 1)         AS Total,
        d.MontoCancelado * IIF(dt.EsInverso = 1, -1, 1)         AS Pagado,
        (d.Total - d.MontoCancelado) * IIF(dt.EsInverso = 1, -1, 1) AS Saldo,
        o.CodOrden                                             AS Referencia
    FROM DocumentoCC d
    INNER JOIN DocumentoTipo dt        ON d.IdDocumentoTipo = dt.IdDocumentoTipo
    INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia
    LEFT JOIN FormaPago fp             ON d.IdFormaPago = fp.IdFormaPago
    LEFT JOIN EstadoTD e               ON d.IdEstado = e.IdEstado
    LEFT JOIN Orden o                  ON d.IdOrden = o.IdOrden
    WHERE d.FechaEmision BETWEEN @FechaIni AND @FechaFin
      AND dtf.CodDocumentoTipoFamilia = 'CC'
      AND d.IdAnexo_ClienteProveedor = @IdAnexo
    ORDER BY d.FechaEmision DESC, d.IdDocumento DESC;
END
GO
