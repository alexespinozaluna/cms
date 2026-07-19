using Dapper;
using Cms.Content.Data;

namespace Cms.Content.Admin;

public sealed class AdminFormulariosRepository(IDbConnectionFactory connectionFactory) : IAdminFormulariosRepository
{
    public async Task<IReadOnlyList<FormularioResumen>> ListarFormulariosAsync(CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<FormularioResumen>(new CommandDefinition("""
            SELECT b.id AS BloqueId, p.slug, p.titulo AS PaginaTitulo,
                   b.contenido->>'titulo' AS Titulo,
                   (SELECT count(*) FROM form_respuestas r WHERE r.bloque_id = b.id) AS Total
            FROM bloques b
            JOIN paginas p       ON p.id = b.pagina_id
            JOIN tipos_bloque tb ON tb.id = b.tipo_bloque_id
            WHERE tb.codigo = 'formulario'
            ORDER BY p.titulo, b.id;
            """, cancellationToken: ct));
        return filas.ToList();
    }

    public async Task<IReadOnlyList<RespuestaAdmin>> ListarRespuestasAsync(int bloqueId, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<RespuestaAdmin>(new CommandDefinition(
            "SELECT id, datos::text AS Datos, creado_en AS CreadoEn FROM form_respuestas WHERE bloque_id = @bloqueId ORDER BY creado_en DESC",
            new { bloqueId }, cancellationToken: ct));
        return filas.ToList();
    }
}
