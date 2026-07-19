namespace Cms.Content.Admin;

/// <summary>Ítem del menú del sitio para administración.</summary>
public sealed class MenuItemAdmin
{
    public int Id { get; set; }
    public int? PadreId { get; set; }
    public string Etiqueta { get; set; } = "";
    public string Url { get; set; } = "";
    public string Tipo { get; set; } = "contenido"; // contenido | sistema
    public short Orden { get; set; }
    public string Estado { get; set; } = "publicado";
    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
}
