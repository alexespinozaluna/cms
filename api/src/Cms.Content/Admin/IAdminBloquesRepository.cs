namespace Cms.Content.Admin;

public interface IAdminBloquesRepository
{
    Task<IReadOnlyList<TipoBloqueAdmin>> ListarTiposAsync(CancellationToken ct = default);
    Task<TipoBloqueAdmin?> ObtenerTipoAsync(short id, CancellationToken ct = default);

    Task<IReadOnlyList<BloqueAdmin>> ListarPorPaginaAsync(int paginaId, CancellationToken ct = default);
    Task<BloqueAdmin?> ObtenerAsync(int id, CancellationToken ct = default);
    Task<int> CrearAsync(int paginaId, short tipoBloqueId, string contenidoJson, string estado, CancellationToken ct = default);
    Task<bool> ActualizarAsync(int id, string contenidoJson, string estado, DateTime? desde, DateTime? hasta, CancellationToken ct = default);
    Task ReordenarAsync(int paginaId, IReadOnlyList<int> idsEnOrden, CancellationToken ct = default);
    Task<bool> EliminarAsync(int id, CancellationToken ct = default);
}
