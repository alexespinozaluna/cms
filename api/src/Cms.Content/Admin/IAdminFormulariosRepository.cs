namespace Cms.Content.Admin;

public sealed class FormularioResumen
{
    public int BloqueId { get; set; }
    public string Slug { get; set; } = "";
    public string PaginaTitulo { get; set; } = "";
    public string? Titulo { get; set; }
    public long Total { get; set; }
}

public sealed class RespuestaAdmin
{
    public long Id { get; set; }
    public string Datos { get; set; } = "{}"; // JSONB como texto
    public DateTime CreadoEn { get; set; }
}

public interface IAdminFormulariosRepository
{
    Task<IReadOnlyList<FormularioResumen>> ListarFormulariosAsync(CancellationToken ct = default);
    Task<IReadOnlyList<RespuestaAdmin>> ListarRespuestasAsync(int bloqueId, CancellationToken ct = default);
}
