using System.Data.Common;
using Npgsql;

namespace Cms.Content.Data;

/// <summary>Fábrica Npgsql basada en NpgsqlDataSource (pooling y configuración centralizados).</summary>
public sealed class NpgsqlConnectionFactory(NpgsqlDataSource dataSource) : IDbConnectionFactory
{
    public async Task<DbConnection> AbrirAsync(CancellationToken ct = default)
        => await dataSource.OpenConnectionAsync(ct);
}
