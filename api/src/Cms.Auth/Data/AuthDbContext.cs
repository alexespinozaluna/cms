using Cms.Auth.Modelo;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Cms.Auth.Data;

/// <summary>
/// Contexto de Identity (único uso de EF Core en el proyecto). Todas las tablas
/// viven en el esquema 'auth' del mismo PostgreSQL del CMS.
/// </summary>
public sealed class AuthDbContext(DbContextOptions<AuthDbContext> options)
    : IdentityDbContext<Usuario>(options)
{
    public const string Esquema = "auth";

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema(Esquema);

        // Una persona del ERP (IdUserRef = IdAnexo) no puede tener más de una
        // cuenta web. Evita duplicados por doble envío/reintento. En PostgreSQL
        // los NULL (usuarios internos sin IdUserRef) se consideran distintos, así
        // que pueden coexistir varios.
        builder.Entity<Usuario>()
            .HasIndex(u => u.IdUserRef)
            .IsUnique();
    }
}
