using Dapper;
using Cms.Content.Data;

namespace Cms.Content.Admin;

/// <summary>Acceso admin a la tabla `paginas` (lectura/escritura) con Dapper.</summary>
public sealed class AdminPaginasRepository(IDbConnectionFactory connectionFactory) : IAdminPaginasRepository
{
    private const string Campos =
        "id, slug, titulo, descripcion_seo AS DescripcionSeo, plantilla, estado, " +
        "vigencia_desde AS VigenciaDesde, vigencia_hasta AS VigenciaHasta, " +
        "creado_en AS CreadoEn, actualizado_en AS ActualizadoEn";

    public async Task<IReadOnlyList<PaginaAdmin>> ListarAsync(CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.QueryAsync<PaginaAdmin>(
            new CommandDefinition($"SELECT {Campos} FROM paginas ORDER BY actualizado_en DESC", cancellationToken: ct));
        return filas.ToList();
    }

    public async Task<PaginaAdmin?> ObtenerAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.QuerySingleOrDefaultAsync<PaginaAdmin>(
            new CommandDefinition($"SELECT {Campos} FROM paginas WHERE id = @id", new { id }, cancellationToken: ct));
    }

    public async Task<bool> SlugExisteAsync(string slug, int? exceptoId, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.ExecuteScalarAsync<bool>(new CommandDefinition(
            "SELECT EXISTS(SELECT 1 FROM paginas WHERE lower(slug) = lower(@slug) AND (@exceptoId IS NULL OR id <> @exceptoId))",
            new { slug, exceptoId }, cancellationToken: ct));
    }

    public async Task<int> CrearAsync(PaginaAdmin p, string creadoPor, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        return await cn.ExecuteScalarAsync<int>(new CommandDefinition("""
            INSERT INTO paginas (slug, titulo, descripcion_seo, plantilla, estado, vigencia_desde, vigencia_hasta, creado_por)
            VALUES (@Slug, @Titulo, @DescripcionSeo, @Plantilla, @Estado, @VigenciaDesde, @VigenciaHasta, @creadoPor)
            RETURNING id;
            """, new { p.Slug, p.Titulo, p.DescripcionSeo, p.Plantilla, p.Estado, p.VigenciaDesde, p.VigenciaHasta, creadoPor }, cancellationToken: ct));
    }

    public async Task<bool> ActualizarAsync(PaginaAdmin p, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition("""
            UPDATE paginas SET slug=@Slug, titulo=@Titulo, descripcion_seo=@DescripcionSeo,
                   plantilla=@Plantilla, estado=@Estado, vigencia_desde=@VigenciaDesde,
                   vigencia_hasta=@VigenciaHasta, actualizado_en=now()
            WHERE id=@Id;
            """, p, cancellationToken: ct));
        return filas > 0;
    }

    public async Task<bool> CambiarEstadoAsync(int id, string estado, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition(
            "UPDATE paginas SET estado=@estado, actualizado_en=now() WHERE id=@id",
            new { id, estado }, cancellationToken: ct));
        return filas > 0;
    }

    public async Task<bool> EliminarAsync(int id, CancellationToken ct = default)
    {
        await using var cn = await connectionFactory.AbrirAsync(ct);
        var filas = await cn.ExecuteAsync(new CommandDefinition(
            "DELETE FROM paginas WHERE id=@id", new { id }, cancellationToken: ct));
        return filas > 0;
    }
}
