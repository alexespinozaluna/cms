namespace Cms.Content.Admin;

public interface IAdminPaginasRepository
{
    Task<IReadOnlyList<PaginaAdmin>> ListarAsync(CancellationToken ct = default);
    Task<PaginaAdmin?> ObtenerAsync(int id, CancellationToken ct = default);
    Task<bool> SlugExisteAsync(string slug, int? exceptoId, CancellationToken ct = default);
    Task<int> CrearAsync(PaginaAdmin p, string creadoPor, CancellationToken ct = default);
    Task<bool> ActualizarAsync(PaginaAdmin p, CancellationToken ct = default);
    Task<bool> CambiarEstadoAsync(int id, string estado, CancellationToken ct = default);
    Task<bool> EliminarAsync(int id, CancellationToken ct = default);
}
