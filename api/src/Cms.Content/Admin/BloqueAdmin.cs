namespace Cms.Content.Admin;

/// <summary>Tipo de bloque (metadata): su código y el esquema de campos (JSON crudo).</summary>
public sealed class TipoBloqueAdmin
{
    public short Id { get; set; }
    public string Codigo { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
    public string EsquemaCampos { get; set; } = "[]"; // JSONB como texto
}

/// <summary>Bloque de una página para administración (contenido JSON crudo).</summary>
public sealed class BloqueAdmin
{
    public int Id { get; set; }
    public int PaginaId { get; set; }
    public short TipoBloqueId { get; set; }
    public string TipoCodigo { get; set; } = "";
    public string TipoNombre { get; set; } = "";
    public short Orden { get; set; }
    public string Contenido { get; set; } = "{}"; // JSONB como texto
    public string Estado { get; set; } = "publicado";
    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
}
