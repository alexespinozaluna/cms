using System.Text.Json;
using Dapper;
using Cms.Content.Data;
using Cms.Content.Dtos;

namespace Cms.Content.Repositories;

public sealed class ContenidoRepository(IDbConnectionFactory connectionFactory) : IContenidoRepository
{
    private const string SqlPaginaConBloques = """
        SELECT id, slug, titulo, descripcion_seo, plantilla
        FROM   v_paginas_publicas
        WHERE  slug = @slug;

        SELECT b.id, b.tipo, b.orden, b.contenido
        FROM   v_bloques_publicos b
        JOIN   v_paginas_publicas p ON p.id = b.pagina_id
        WHERE  p.slug = @slug
        ORDER  BY b.orden, b.id;
        """;

    private const string SqlMenu = """
        SELECT id, padre_id, etiqueta, url, tipo, orden
        FROM   v_menu_publico
        ORDER  BY padre_id NULLS FIRST, orden, id;
        """;

    public async Task<PaginaDetalleDto?> ObtenerPaginaPorSlugAsync(string slug, CancellationToken ct = default)
    {
        await using var conexion = await connectionFactory.AbrirAsync(ct);
        await using var lector = await conexion.QueryMultipleAsync(
            new CommandDefinition(SqlPaginaConBloques, new { slug }, cancellationToken: ct));

        var pagina = await lector.ReadSingleOrDefaultAsync<PaginaPublicaDto>();
        if (pagina is null) return null;

        var bloques = await lector.ReadAsync<BloqueRow>();

        return new PaginaDetalleDto
        {
            Slug = pagina.Slug,
            Titulo = pagina.Titulo,
            DescripcionSeo = pagina.DescripcionSeo,
            Plantilla = pagina.Plantilla,
            Bloques = bloques.Select(b => new BloquePublicoDto
            {
                Id = b.Id,
                Tipo = b.Tipo,
                Orden = b.Orden,
                // El JSONB llega como texto; se re-expone como JSON real, nunca como string escapado
                Contenido = JsonSerializer.Deserialize<JsonElement>(b.Contenido)
            }).ToList()
        };
    }

    public async Task<IReadOnlyList<MenuItemPublicoDto>> ObtenerMenuAsync(CancellationToken ct = default)
    {
        await using var conexion = await connectionFactory.AbrirAsync(ct);
        var filas = await conexion.QueryAsync<MenuRow>(
            new CommandDefinition(SqlMenu, cancellationToken: ct));

        // Arma el árbol en memoria: el menú es chico y ya viene ordenado
        var porId = filas.ToDictionary(
            f => f.Id,
            f => new MenuItemPublicoDto
            {
                Id = f.Id, Etiqueta = f.Etiqueta, Url = f.Url, Tipo = f.Tipo, Orden = f.Orden
            });

        var raices = new List<MenuItemPublicoDto>();
        foreach (var fila in filas)
        {
            // Un padre no publicado/vigente no está en el diccionario: sus hijos se omiten
            if (fila.PadreId is null)
                raices.Add(porId[fila.Id]);
            else if (porId.TryGetValue(fila.PadreId.Value, out var padre))
                padre.Hijos.Add(porId[fila.Id]);
        }
        return raices;
    }

    public async Task<bool> GuardarRespuestaFormularioAsync(int bloqueId, JsonElement datos, CancellationToken ct = default)
    {
        // La subconsulta contra la vista garantiza bloque publicado, vigente y de tipo 'formulario'
        const string sql = """
            INSERT INTO form_respuestas (bloque_id, datos)
            SELECT b.id, @datos::jsonb
            FROM   v_bloques_publicos b
            WHERE  b.id = @bloqueId AND b.tipo = 'formulario';
            """;

        await using var conexion = await connectionFactory.AbrirAsync(ct);
        var insertadas = await conexion.ExecuteAsync(
            new CommandDefinition(sql, new { bloqueId, datos = datos.GetRawText() }, cancellationToken: ct));
        return insertadas > 0;
    }

    // Filas intermedias de Dapper (jsonb llega como string)
    private sealed class BloqueRow
    {
        public int Id { get; init; }
        public string Tipo { get; init; } = string.Empty;
        public int Orden { get; init; }
        public string Contenido { get; init; } = "{}";
    }

    private sealed class MenuRow
    {
        public int Id { get; init; }
        public int? PadreId { get; init; }
        public string Etiqueta { get; init; } = string.Empty;
        public string Url { get; init; } = string.Empty;
        public string Tipo { get; init; } = string.Empty;
        public int Orden { get; init; }
    }
}
