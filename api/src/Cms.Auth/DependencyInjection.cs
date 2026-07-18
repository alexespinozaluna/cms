using System.Text;
using Cms.Auth.Data;
using Cms.Auth.Jwt;
using Cms.Auth.Modelo;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Cms.Auth;

public static class DependencyInjection
{
    /// <summary>
    /// Registra el dominio de identidad: EF Core (esquema auth), ASP.NET Identity,
    /// emisor de JWT y autenticación/ autorización por bearer.
    /// </summary>
    public static IServiceCollection AddDominioAuth(
        this IServiceCollection services, string cadenaConexion, IConfiguration config)
    {
        var jwt = config.GetSection(JwtOptions.Seccion).Get<JwtOptions>()
                  ?? throw new InvalidOperationException("Falta la sección de configuración 'Jwt'.");
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.Seccion));

        services.AddDbContext<AuthDbContext>(opciones =>
            opciones.UseNpgsql(cadenaConexion, npg =>
                npg.MigrationsHistoryTable("__EFMigrationsHistory", AuthDbContext.Esquema)));

        services.AddIdentityCore<Usuario>(o =>
            {
                o.User.RequireUniqueEmail = true;
                o.Password.RequiredLength = 8;
                o.Password.RequireNonAlphanumeric = false;
                o.SignIn.RequireConfirmedEmail = false; // se activará con el flujo de correo
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AuthDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<IGeneradorJwt, GeneradorJwt>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opciones =>
            {
                opciones.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                };
            });

        services.AddAuthorization();
        return services;
    }

    /// <summary>Aplica migraciones pendientes y crea los roles base (idempotente).</summary>
    public static async Task PrepararAuthAsync(this IServiceProvider proveedor)
    {
        using var scope = proveedor.CreateScope();
        var sp = scope.ServiceProvider;

        await sp.GetRequiredService<AuthDbContext>().Database.MigrateAsync();

        var roles = sp.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var rol in Roles.Todos)
            if (!await roles.RoleExistsAsync(rol))
                await roles.CreateAsync(new IdentityRole(rol));
    }
}
