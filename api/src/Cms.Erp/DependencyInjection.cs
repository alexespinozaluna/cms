using Cms.Erp.Documentos;
using Cms.Erp.Personas;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cms.Erp;

public static class DependencyInjection
{
    /// <summary>
    /// Registra el acceso al ERP. Usa las implementaciones reales (SQL Server) si
    /// existe la cadena de conexión 'ErpDb'; en caso contrario, los stubs de dev.
    /// </summary>
    public static IServiceCollection AddDominioErp(this IServiceCollection services, IConfiguration config)
    {
        var cadena = config.GetConnectionString("ErpDb");
        var conErp = !string.IsNullOrWhiteSpace(cadena);

        if (conErp)
        {
            services.AddScoped<IConsultaPersonasErp>(_ => new ConsultaPersonasErpSql(cadena!));
            services.AddScoped<IConsultaDocumentosErp>(_ => new ConsultaDocumentosErpSql(cadena!));
        }
        else
        {
            services.AddScoped<IConsultaPersonasErp, ConsultaPersonasErpStub>();
            services.AddScoped<IConsultaDocumentosErp, ConsultaDocumentosErpStub>();
        }
        return services;
    }
}
