-- ============================================================================
-- Descripción breve : Busca una persona en Anexo por CIP (CodAnexo) o DNI
--                     (Documento) para el login/registro del PORTAL WEB.
--                     Objeto de SOLO LECTURA creado para el portal (el ERP es
--                     intocable); no modifica datos del ERP.
-- Input             : @Documento VARCHAR(20)  -- CIP o DNI
-- Output            : 0 o 1 fila con IdAnexo, Cip, Nombre, Direccion,
--                     TipoDocumento, NroDni, Ruc y los flags de rol
--                     (EsCliente, EsProveedor, EsConcesionario, EsTrabajador).
--                     Solo devuelve personas activas y con al menos un rol.
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Login único del portal — resolver identidad y roles
--                     desde el ERP sin exponer SELECT directo a Anexo.
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial
-- ============================================================================

IF OBJECT_ID('dbo.spWebAnexoBuscarPorDocumento', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebAnexoBuscarPorDocumento;
GO

CREATE PROCEDURE dbo.spWebAnexoBuscarPorDocumento
    @Documento VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        A.IdAnexo,
        A.CodAnexo                                   AS Cip,
        A.NomAnexo                                   AS Nombre,
        A.Direccion,
        B.TipoTipoDocumentoIdentidad                 AS TipoDocumento,
        A.Documento                                  AS NroDni,
        A.RUC                                        AS Ruc,
        A.EsCliente,
        A.EsProveedor,
        A.EsConcesionario,
        CASE WHEN A.EsTrabajador = 1 AND A.EsDomiciliado = 1 THEN 1 ELSE 0 END AS EsTrabajador
    FROM Anexo A
    INNER JOIN TipoDocumentoIdentidadSunat B
        ON A.IdTipoDocumentoIdentidad = B.IdTipoDocumentoIdentidad
    WHERE A.EsDesactivado = 0
      AND (A.EsCliente = 1 OR A.EsProveedor = 1 OR A.EsConcesionario = 1
           OR (A.EsTrabajador = 1 AND A.EsDomiciliado = 1))
      AND (A.CodAnexo = @Documento OR A.Documento = @Documento);
END
GO
