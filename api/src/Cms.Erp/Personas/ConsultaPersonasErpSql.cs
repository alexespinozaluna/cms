using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Cms.Erp.Personas;

/// <summary>
/// Implementación real contra el SQL Server del ERP (solo lectura). Llama al SP
/// dedicado del portal <c>dbo.spWebAnexoBuscarPorDocumento</c> (script en
/// <c>api/db/mssql/</c>, lo ejecuta el usuario). Se activa cuando existe la
/// cadena de conexión 'ErpDb'.
/// </summary>
public sealed class ConsultaPersonasErpSql(string cadenaConexion) : IConsultaPersonasErp
{
    private const string SpBuscar = "dbo.spWebAnexoBuscarPorDocumento";

    public async Task<PersonaErp?> BuscarPorDocumentoAsync(string cipDni, CancellationToken ct = default)
    {
        await using var conexion = new SqlConnection(cadenaConexion);
        return await conexion.QuerySingleOrDefaultAsync<PersonaErp>(
            new CommandDefinition(
                SpBuscar,
                new { Documento = cipDni?.Trim() },
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
    }
}
