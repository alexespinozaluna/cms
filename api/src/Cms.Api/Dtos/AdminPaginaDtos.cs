using System.ComponentModel.DataAnnotations;

namespace Cms.Api.Dtos;

/// <summary>Crear/editar una página del CMS.</summary>
public sealed class PaginaGuardarRequest
{
    [Required, RegularExpression(@"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        ErrorMessage = "El slug usa minúsculas, números y guiones (ej. 'nuestras-tiendas').")]
    [MaxLength(120)]
    public string Slug { get; set; } = "";

    [Required, MaxLength(200)]
    public string Titulo { get; set; } = "";

    [MaxLength(300)]
    public string? DescripcionSeo { get; set; }

    [MaxLength(50)]
    public string Plantilla { get; set; } = "default";

    [Required]
    public string Estado { get; set; } = "borrador";

    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
}

public sealed class CambiarEstadoRequest
{
    [Required]
    public string Estado { get; set; } = "";
}
