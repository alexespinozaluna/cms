using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Cms.Erp.Personas;

/// <summary>
/// Implementación real contra el SQL Server del ERP (solo lectura sobre Anexo).
/// Se activa cuando existe la cadena de conexión 'ErpDb'.
/// </summary>
public sealed class ConsultaPersonasErpSql(string cadenaConexion) : IConsultaPersonasErp
{
    // Basada en el script de permisos del ERP: activo + con algún rol,
    // buscando por CIP (CodAnexo) o DNI (Documento).
    private const string Sql = """
        SELECT TOP 1
            A.IdAnexo,
            A.CodAnexo                                  AS Cip,
            A.NomAnexo                                  AS Nombre,
            A.Direccion,
            B.TipoTipoDocumentoIdentidad                AS TipoDocumento,
            A.Documento                                 AS NroDni,
            A.RUC                                       AS Ruc,
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
          AND (A.CodAnexo = @doc OR A.Documento = @doc);
        """;

    public async Task<PersonaErp?> BuscarPorDocumentoAsync(string cipDni, CancellationToken ct = default)
    {
        await using var conexion = new SqlConnection(cadenaConexion);
        return await conexion.QuerySingleOrDefaultAsync<PersonaErp>(
            new CommandDefinition(Sql, new { doc = cipDni?.Trim() }, cancellationToken: ct));
    }
}
