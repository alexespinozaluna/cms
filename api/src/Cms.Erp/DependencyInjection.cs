using Cms.Erp.Clientes;
using Microsoft.Extensions.DependencyInjection;

namespace Cms.Erp;

public static class DependencyInjection
{
    /// <summary>
    /// Registra el acceso al ERP. Hoy usa el stub en memoria; cuando exista el
    /// SP real, aquí se cambia por la implementación Dapper/SqlClient.
    /// </summary>
    public static IServiceCollection AddDominioErp(this IServiceCollection services)
    {
        services.AddScoped<IValidadorClientesErp, ValidadorClientesErpStub>();
        return services;
    }
}
