using Cms.Content.Dtos;

namespace Cms.Content.Repositories;

/// <summary>
/// Lectura pública del CMS. Consume EXCLUSIVAMENTE las vistas v_* del modelo,
/// que ya aplican la regla de estado + vigencia (fne_vigente).
/// </summary>
public interface IContenidoRepository
{
    /// <summary>Página publicada y vigente con sus bloques; null si no existe o no está vigente.</summary>
    Task<PaginaDetalleDto?> ObtenerPaginaPorSlugAsync(string slug, CancellationToken ct = default);

    /// <summary>Árbol de menú publicado y vigente, ordenado.</summary>
    Task<IReadOnlyList<MenuItemPublicoDto>> ObtenerMenuAsync(CancellationToken ct = default);

    /// <summary>
    /// Guarda una respuesta de formulario dinámico. Solo acepta si el bloque
    /// existe, es de tipo 'formulario' y está publicado y vigente.
    /// Devuelve false si el bloque no califica.
    /// </summary>
    Task<bool> GuardarRespuestaFormularioAsync(int bloqueId, System.Text.Json.JsonElement datos, CancellationToken ct = default);
}
