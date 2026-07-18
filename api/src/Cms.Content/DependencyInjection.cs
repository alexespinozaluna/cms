using Dapper;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Cms.Content.Data;
using Cms.Content.Repositories;

namespace Cms.Content;

public static class DependencyInjection
{
    /// <summary>Registra el dominio de contenido (CMS en PostgreSQL, acceso vía Dapper).</summary>
    public static IServiceCollection AddDominioContenido(this IServiceCollection services, string cadenaConexion)
    {
        // Mapea columnas snake_case (descripcion_seo, padre_id...) a propiedades PascalCase
        DefaultTypeMap.MatchNamesWithUnderscores = true;

        services.AddSingleton(_ => new NpgsqlDataSourceBuilder(cadenaConexion).Build());
        services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
        services.AddScoped<IContenidoRepository, ContenidoRepository>();
        return services;
    }
}
