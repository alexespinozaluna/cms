using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Cms.Erp.Documentos;

/// <summary>
/// Implementación real contra el SQL Server del ERP (solo lectura), vía los SPs
/// del portal en <c>api/db/mssql/</c> (los ejecuta el usuario). Se activa con la
/// cadena de conexión 'ErpDb'.
/// </summary>
public sealed class ConsultaDocumentosErpSql(string cadenaConexion) : IConsultaDocumentosErp
{
    public async Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
    {
        await using var conexion = new SqlConnection(cadenaConexion);
        var filas = await conexion.QueryAsync<MovimientoErp>(
            new CommandDefinition(
                "dbo.spWebMisCompras",
                new { IdAnexo = idAnexo, FechaIni = desde, FechaFin = hasta },
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
        return filas.ToList();
    }
}
