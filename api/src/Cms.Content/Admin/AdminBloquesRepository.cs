using Dapper;
using Cms.Content.Data;

namespace Cms.Content.Admin;

public sealed class AdminBloquesRepository(IDbConnectionFactory connectionFactory) : IAdminBloquesRepository
{
    public async Task<IReadOnlyList<TipoBloqueAdmin>> ListarTiposAsync(CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<TipoBloqueAdmin>(new CommandDefinition(
            "SELECT id, codigo, nombre, descripcion, esquema_campos::text AS EsquemaCampos FROM tipos_bloque WHERE activo ORDER BY id",
            cancellationToken: ct));
        return filas.ToList();
    }

    public async Task<TipoBloqueAdmin?> ObtenerTipoAsync(short id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.QuerySingleOrDefaultAsync<TipoBloqueAdmin>(new CommandDefinition(
            "SELECT id, codigo, nombre, descripcion, esquema_campos::text AS EsquemaCampos FROM tipos_bloque WHERE id = @id",
            new { id }, cancellationToken: ct));
    }

    private const string CamposBloque = """
        SELECT b.id, b.pagina_id AS PaginaId, b.tipo_bloque_id AS TipoBloqueId,
               tb.codigo AS TipoCodigo, tb.nombre AS TipoNombre, b.orden,
               b.contenido::text AS Contenido, b.estado,
               b.vigencia_desde AS VigenciaDesde, b.vigencia_hasta AS VigenciaHasta
        FROM bloques b JOIN tipos_bloque tb ON tb.id = b.tipo_bloque_id
        """;

    public async Task<IReadOnlyList<BloqueAdmin>> ListarPorPaginaAsync(int paginaId, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<BloqueAdmin>(new CommandDefinition(
            $"{CamposBloque} WHERE b.pagina_id = @paginaId ORDER BY b.orden, b.id",
            new { paginaId }, cancellationToken: ct));
        return filas.ToList();
    }

    public async Task<BloqueAdmin?> ObtenerAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.QuerySingleOrDefaultAsync<BloqueAdmin>(new CommandDefinition(
            $"{CamposBloque} WHERE b.id = @id", new { id }, cancellationToken: ct));
    }

    public async Task<int> CrearAsync(int paginaId, short tipoBloqueId, string contenidoJson, string estado, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.ExecuteScalarAsync<int>(new CommandDefinition("""
            INSERT INTO bloques (pagina_id, tipo_bloque_id, orden, contenido, estado)
            VALUES (@paginaId, @tipoBloqueId,
                    COALESCE((SELECT MAX(orden) + 1 FROM bloques WHERE pagina_id = @paginaId), 1),
                    @contenidoJson::jsonb, @estado)
            RETURNING id;
            """, new { paginaId, tipoBloqueId, contenidoJson, estado }, cancellationToken: ct));
    }

    public async Task<bool> ActualizarAsync(int id, string contenidoJson, string estado, DateTime? desde, DateTime? hasta, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition("""
            UPDATE bloques SET contenido = @contenidoJson::jsonb, estado = @estado,
                   vigencia_desde = @desde, vigencia_hasta = @hasta, actualizado_en = now()
            WHERE id = @id;
            """, new { id, contenidoJson, estado, desde, hasta }, cancellationToken: ct));
        return filas > 0;
    }

    public async Task ReordenarAsync(int paginaId, IReadOnlyList<int> idsEnOrden, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        for (var i = 0; i < idsEnOrden.Count; i++)
            await cn.ExecuteAsync(new CommandDefinition(
                "UPDATE bloques SET orden = @orden WHERE id = @id AND pagina_id = @paginaId",
                new { orden = (short)(i + 1), id = idsEnOrden[i], paginaId }, cancellationToken: ct));
    }

    public async Task<bool> EliminarAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition(
            "DELETE FROM bloques WHERE id = @id", new { id }, cancellationToken: ct));
        return filas > 0;
    }
}
