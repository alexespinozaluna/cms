using Cms.Erp.Personas;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cms.Erp;

public static class DependencyInjection
{
    /// <summary>
    /// Registra el acceso al ERP. Usa la implementación real (SQL Server) si existe
    /// la cadena de conexión 'ErpDb'; en caso contrario, el stub de desarrollo.
    /// </summary>
    public static IServiceCollection AddDominioErp(this IServiceCollection services, IConfiguration config)
    {
        var cadena = config.GetConnectionString("ErpDb");
        if (!string.IsNullOrWhiteSpace(cadena))
            services.AddScoped<IConsultaPersonasErp>(_ => new ConsultaPersonasErpSql(cadena));
        else
            services.AddScoped<IConsultaPersonasErp, ConsultaPersonasErpStub>();
        return services;
    }
}
