using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Cms.Auth.Data;

/// <summary>
/// Fábrica usada SOLO por las herramientas de EF Core (dotnet ef) para generar
/// y aplicar migraciones sin arrancar Cms.Api. La cadena viene de la variable
/// de entorno CMS_AUTH_CS para no versionar credenciales.
/// </summary>
public sealed class DesignTimeAuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
{
    public AuthDbContext CreateDbContext(string[] args)
    {
        var cs = Environment.GetEnvironmentVariable("CMS_AUTH_CS")
            ?? throw new InvalidOperationException(
                "Defina CMS_AUTH_CS con la cadena de conexión de PostgreSQL para ejecutar EF Core.");

        var opciones = new DbContextOptionsBuilder<AuthDbContext>()
            .UseNpgsql(cs, npg =>
                npg.MigrationsHistoryTable("__EFMigrationsHistory", AuthDbContext.Esquema))
            .Options;

        return new AuthDbContext(opciones);
    }
}
