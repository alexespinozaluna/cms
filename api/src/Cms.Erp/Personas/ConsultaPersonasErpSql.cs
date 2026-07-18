using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Cms.Erp.Personas;

/// <summary>
/// Implementación real contra el SQL Server del ERP (solo lectura). Llama al SP
/// genérico del portal <c>dbo.spWebAnexoBuscarPorDocumento</c> (@Documento, @Tipo)
/// (script en <c>api/db/mssql/</c>, lo ejecuta el usuario). Se activa cuando
/// existe la cadena de conexión 'ErpDb'.
/// </summary>
public sealed class ConsultaPersonasErpSql(string cadenaConexion) : IConsultaPersonasErp
{
    private const string SpBuscar = "dbo.spWebAnexoBuscarPorDocumento";

    public async Task<PersonaErp?> BuscarPorDocumentoAsync(
        string documento, TipoDocumentoBusqueda tipo = TipoDocumentoBusqueda.Ambos, CancellationToken ct = default)
    {
        await using var conexion = new SqlConnection(cadenaConexion);
        return await conexion.QuerySingleOrDefaultAsync<PersonaErp>(
            new CommandDefinition(
                SpBuscar,
                new { Documento = documento?.Trim(), Tipo = (int)tipo },
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
    }
}
