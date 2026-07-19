namespace Cms.Content.Admin;

public interface IAdminMenuRepository
{
    Task<IReadOnlyList<MenuItemAdmin>> ListarAsync(CancellationToken ct = default);
    Task<MenuItemAdmin?> ObtenerAsync(int id, CancellationToken ct = default);
    Task<int> CrearAsync(MenuItemAdmin m, CancellationToken ct = default);
    Task<bool> ActualizarAsync(MenuItemAdmin m, CancellationToken ct = default);
    Task ReordenarAsync(IReadOnlyList<int> idsEnOrden, CancellationToken ct = default);
    Task<bool> EliminarAsync(int id, CancellationToken ct = default);
}
