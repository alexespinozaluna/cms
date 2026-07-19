namespace Cms.Content.Admin;

/// <summary>Página del CMS para administración (todos los estados, campos editables).</summary>
public sealed class PaginaAdmin
{
    public int Id { get; set; }
    public string Slug { get; set; } = "";
    public string Titulo { get; set; } = "";
    public string? DescripcionSeo { get; set; }
    public string Plantilla { get; set; } = "default";
    public string Estado { get; set; } = "borrador";
    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
    public DateTime CreadoEn { get; set; }
    public DateTime ActualizadoEn { get; set; }
}

/// <summary>Slugs reservados por rutas de sistema (no pueden usarse como página CMS).</summary>
public static class SlugsReservados
{
    public static readonly HashSet<string> Valores = new(StringComparer.OrdinalIgnoreCase)
    {
        "registro", "login", "recuperar", "portal", "cliente", "proveedor", "admin", "api",
    };

    public static readonly string[] EstadosValidos = ["borrador", "publicado", "archivado"];

    public static bool EsReservado(string slug) => Valores.Contains(slug.Trim());
}
