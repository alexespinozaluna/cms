using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Cms.Erp.Documentos;

/// <summary>
/// Implementación real contra el SQL Server del ERP (solo lectura), vía los SPs
/// del portal en <c>api/db/mssql/</c> (los ejecuta el usuario). Se activa con la
/// cadena de conexión 'ErpDb'. Todos los SPs comparten firma y forma de salida.
/// </summary>
public sealed class ConsultaDocumentosErpSql(string cadenaConexion) : IConsultaDocumentosErp
{
    public Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => EjecutarAsync("dbo.spWebMisCompras", idAnexo, desde, hasta, ct);

    public Task<IReadOnlyList<MovimientoErp>> EstadoCuentaAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => EjecutarAsync("dbo.spWebEstadoCuenta", idAnexo, desde, hasta, ct);

    public Task<IReadOnlyList<MovimientoErp>> LiquidacionPagosAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => EjecutarAsync("dbo.spWebLiquidacionPagos", idAnexo, desde, hasta, ct);

    public Task<IReadOnlyList<MovimientoErp>> MisFacturasAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => EjecutarAsync("dbo.spWebMisFacturas", idAnexo, desde, hasta, ct);

    private async Task<IReadOnlyList<MovimientoErp>> EjecutarAsync(
        string sp, int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct)
    {
        await using var conexion = new SqlConnection(cadenaConexion);
        var filas = await conexion.QueryAsync<MovimientoErp>(
            new CommandDefinition(
                sp,
                new { IdAnexo = idAnexo, FechaIni = desde, FechaFin = hasta },
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
        return filas.ToList();
    }
}
