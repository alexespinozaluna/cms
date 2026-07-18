using System.Data.Common;

namespace Cms.Content.Data;

/// <summary>
/// Fábrica de conexiones del dominio de contenido (PostgreSQL).
/// Cada operación abre su propia conexión y la libera al terminar;
/// el pooling lo maneja Npgsql.
/// </summary>
public interface IDbConnectionFactory
{
    Task<DbConnection> AbrirAsync(CancellationToken ct = default);
}
