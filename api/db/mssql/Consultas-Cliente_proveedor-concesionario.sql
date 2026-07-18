DECLARE @Fechaini DATETIME ='01/04/2026'
DECLARE @FechaFin DATETIME='30/05/2026'
DECLARE @IdAnexo INT  = 381026


SELECT d.IdDocumento, ISNULL(dt.NomDocumentoTipoCorto,dt.NomDocumentoTipo) AS TipoDoc,d.FechaEmision, CONCAT( d.SerieDocumento,'-', d.CodDocumento ) AS NroSerieDoc,
fp.NomFormaPago,E.NomEstado, dt.EsInverso,
d.Total * IIF(dt.EsInverso=1,-1,1) AS Total,  
D.MontoCancelado * IIF(dt.EsInverso=1,-1,1)  AS Pagado, 
(d.Total - D.MontoCancelado) * IIF(dt.EsInverso=1,-1,1) AS Saldo,
o.CodOrden AS Referencia
FROM DocumentoCC d
INNER JOIN  DocumentoTipo dt ON d.IdDocumentoTipo = dt.IdDocumentoTipo
INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia 
LEFT JOIN FormaPago fp ON d.IdFormaPago  = fp.IdFormaPago
LEFT JOIN EstadoTD e ON d.IdEstado= e.IdEstado
LEFT JOIN Orden o  ON d.IdOrden = o.IdOrden
WHERE d.FechaEmision BETWEEN @Fechaini AND @FechaFin  AND 
dtf.CodDocumentoTipoFamilia = 'CC'
AND d.IdAnexo_ClienteProveedor = @IdAnexo


RETURN
-- Mis Compras
SET @IdAnexo = 296498

SELECT d.IdDocumento, ISNULL(dt.NomDocumentoTipoCorto,dt.NomDocumentoTipo) AS TipoDoc,d.FechaEmision, CONCAT( d.SerieDocumento,'-', d.CodDocumento ) AS NroSerieDoc ,fv.NomFormaVenta,E.NomEstado, 
 dt.EsInverso,
d.Total * IIF(dt.EsInverso=1,-1,1) AS Total,  
D.MontoCancelado * IIF(dt.EsInverso=1,-1,1)  AS Pagado, 
(d.Total - D.MontoCancelado) * IIF(dt.EsInverso=1,-1,1) AS Saldo,
Referencia
FROM DocumentoCV d
INNER JOIN  DocumentoTipo dt ON d.IdDocumentoTipo = dt.IdDocumentoTipo
INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia 
INNER JOIN FormaVentaTD fv ON d.IdFormaVenta  = fv.IdFormaVenta
INNER JOIN EstadoTD e ON d.IdEstado= e.IdEstado
WHERE d.FechaEmision BETWEEN @Fechaini AND @FechaFin  AND dtf.CodDocumentoTipoFamilia in ( 'CV' ,'CCL')
AND IdAnexo_ClienteProveedor = @IdAnexo

-- Mis Deudas
SELECT d.IdDocumento, ISNULL(dt.NomDocumentoTipoCorto,dt.NomDocumentoTipo) AS TipoDoc,d.FechaEmision,  CONCAT( d.SerieDocumento,'-', d.CodDocumento ) AS NroSerieDoc,fv.NomFormaVenta,E.NomEstado, 
 dt.EsInverso,
d.Total * IIF(dt.EsInverso=1,-1,1) AS Total,  
D.MontoCancelado * IIF(dt.EsInverso=1,-1,1)  AS Pagado, 
(d.Total - D.MontoCancelado) * IIF(dt.EsInverso=1,-1,1) AS Saldo, D.Referencia  
FROM DocumentoCV d
INNER JOIN  DocumentoTipo dt ON d.IdDocumentoTipo = dt.IdDocumentoTipo
INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia 
INNER JOIN FormaVentaTD fv ON d.IdFormaVenta  = fv.IdFormaVenta
INNER JOIN EstadoTD e ON d.IdEstado= e.IdEstado
WHERE  dtf.CodDocumentoTipoFamilia in ( 'CV' ,'CCL')
AND FV.NomFormaVenta =N'CREDITO' AND e.NomEstado =N'PENDIENTE'
AND IdAnexo_ClienteProveedor = @IdAnexo

-- Concesionario

SET @IdAnexo = 304022

SELECT d.IdDocumento, ISNULL(dt.NomDocumentoTipoCorto,dt.NomDocumentoTipo) AS TipoDoc,d.FechaEmision, CONCAT(dt.CodDocumentoTipo,'-', d.CodDocumento ) AS NroSerieDoc, NULL AS NomFormaVenta,E.NomEstado, 
 dt.EsInverso,
d.Total * IIF(dt.EsInverso=1,-1,1) AS Total,  
D.MontoCancelado * IIF(dt.EsInverso=1,-1,1)  AS Pagado, 
(d.Total - D.MontoCancelado) * IIF(dt.EsInverso=1,-1,1) AS Saldo, 
ISNULL(dtr.NomDocumentoTipoCorto,dtr.NomDocumentoTipo) AS Referencia  
FROM DocumentoVA d
INNER JOIN  DocumentoTipo dt ON d.IdDocumentoTipo = dt.IdDocumentoTipo
INNER JOIN  DocumentoTipo dtr ON d.IdDocumentoTipo_Referencia = dtr.IdDocumentoTipo
INNER JOIN DocumentoTipoFamiliaTD dtf ON dt.IdDocumentoTipoFamilia = dtf.IdDocumentoTipoFamilia 
--INNER JOIN FormaVentaTD fv ON d.IdFormaVenta  = fv.IdFormaVenta
INNER JOIN EstadoTD e ON d.IdEstado= e.IdEstado
WHERE  --dtf.CodDocumentoTipoFamilia in ( 'CCO' ,'ACO','OA')
1=1
AND d.FechaEmision BETWEEN @Fechaini AND @FechaFin 
--AND FV.NomFormaVenta =N'CREDITO' AND e.NomEstado =N'PENDIENTE'
--AND IdAnexo_ClienteProveedor = @IdAnexo