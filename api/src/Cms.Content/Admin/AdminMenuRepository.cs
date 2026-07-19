using Dapper;
using Cms.Content.Data;

namespace Cms.Content.Admin;

public sealed class AdminMenuRepository(IDbConnectionFactory connectionFactory) : IAdminMenuRepository
{
    private const string Campos =
        "id, padre_id AS PadreId, etiqueta, url, tipo, orden, estado, " +
        "vigencia_desde AS VigenciaDesde, vigencia_hasta AS VigenciaHasta";

    public async Task<IReadOnlyList<MenuItemAdmin>> ListarAsync(CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<MenuItemAdmin>(new CommandDefinition(
            $"SELECT {Campos} FROM menu_items ORDER BY padre_id NULLS FIRST, orden, id", cancellationToken: ct));
        return filas.ToList();
    }

    public async Task<MenuItemAdmin?> ObtenerAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.QuerySingleOrDefaultAsync<MenuItemAdmin>(new CommandDefinition(
            $"SELECT {Campos} FROM menu_items WHERE id = @id", new { id }, cancellationToken: ct));
    }

    public async Task<int> CrearAsync(MenuItemAdmin m, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.ExecuteScalarAsync<int>(new CommandDefinition("""
            INSERT INTO menu_items (padre_id, etiqueta, url, tipo, orden, estado, vigencia_desde, vigencia_hasta)
            VALUES (@PadreId, @Etiqueta, @Url, @Tipo,
                    COALESCE((SELECT MAX(orden) + 1 FROM menu_items WHERE padre_id IS NOT DISTINCT FROM @PadreId), 1),
                    @Estado, @VigenciaDesde, @VigenciaHasta)
            RETURNING id;
            """, m, cancellationToken: ct));
    }

    public async Task<bool> ActualizarAsync(MenuItemAdmin m, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition("""
            UPDATE menu_items SET padre_id=@PadreId, etiqueta=@Etiqueta, url=@Url, tipo=@Tipo,
                   estado=@Estado, vigencia_desde=@VigenciaDesde, vigencia_hasta=@VigenciaHasta
            WHERE id=@Id;
            """, m, cancellationToken: ct));
        return filas > 0;
    }

    public async Task ReordenarAsync(IReadOnlyList<int> idsEnOrden, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        for (var i = 0; i < idsEnOrden.Count; i++)
            await cn.ExecuteAsync(new CommandDefinition(
                "UPDATE menu_items SET orden = @orden WHERE id = @id",
                new { orden = (short)(i + 1), id = idsEnOrden[i] }, cancellationToken: ct));
    }

    public async Task<bool> EliminarAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition(
            "DELETE FROM menu_items WHERE id = @id", new { id }, cancellationToken: ct));
        return filas > 0;
    }
}
