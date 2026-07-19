using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Cms.Api.Dtos;

public sealed class BloqueCrearRequest
{
    [Required]
    public short TipoBloqueId { get; set; }

    public JsonElement Contenido { get; set; }

    [Required]
    public string Estado { get; set; } = "publicado";
}

public sealed class BloqueActualizarRequest
{
    public JsonElement Contenido { get; set; }

    [Required]
    public string Estado { get; set; } = "publicado";

    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
}

public sealed class ReordenarBloquesRequest
{
    [Required]
    public int[] Ids { get; set; } = [];
}
