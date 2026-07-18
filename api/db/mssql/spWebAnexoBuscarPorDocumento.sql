
IF OBJECT_ID('dbo.spWebAnexoBuscarPorDocumento', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spWebAnexoBuscarPorDocumento;
GO
-- ============================================================================
-- Descripción breve : Busca una persona en Anexo por CIP (CodAnexo) o DNI
--                     (Documento) para el login/registro del PORTAL WEB.
--                     Objeto de SOLO LECTURA creado para el portal (el ERP es
--                     intocable); no modifica datos del ERP.
--                     Genérico: el criterio de búsqueda lo controla @Tipo (DRY).
-- Input             : @Documento VARCHAR(20)  -- CIP o DNI
--                     @Tipo      INT = 0       -- 0 = CIP o DNI, 1 = DNI, 2 = CIP
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
--   18/07/2026  Alex Espinoza  Se agrega @Tipo (0=CIP o DNI, 1=DNI, 2=CIP) para
--                              hacer el proc genérico (DRY): un solo SP cubre
--                              búsqueda por DNI, por CIP o por ambos.
-- ============================================================================
CREATE PROCEDURE dbo.spWebAnexoBuscarPorDocumento
    @Documento VARCHAR(20),
    @Tipo      INT = 0
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
      AND (
              (@Tipo = 1 AND A.Documento = @Documento)                       -- DNI
           OR (@Tipo = 2 AND A.CodAnexo  = @Documento)                       -- CIP
           OR (@Tipo = 0 AND (A.CodAnexo = @Documento OR A.Documento = @Documento))
          );
END
GO
