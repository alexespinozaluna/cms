using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Cms.Content.Dtos;
using Cms.Content.Repositories;

namespace Cms.Api.Controllers;

/// <summary>
/// Content API pública: solo entrega contenido publicado y vigente
/// (la regla vive en las vistas v_* de PostgreSQL, no aquí).
/// </summary>
[ApiController]
[Route("api/contenido")]
public sealed class ContenidoController(IContenidoRepository repositorio) : ControllerBase
{
    /// <summary>Página por slug con sus bloques, para el catch-all de Next.js.</summary>
    [HttpGet("paginas/{slug}")]
    [ProducesResponseType(typeof(PaginaDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerPagina(string slug, CancellationToken ct)
    {
        var pagina = await repositorio.ObtenerPaginaPorSlugAsync(slug, ct);
        return pagina is null ? NotFound() : Ok(pagina);
    }

    /// <summary>Árbol de menú del sitio público.</summary>
    [HttpGet("menu")]
    [ProducesResponseType(typeof(IReadOnlyList<MenuItemPublicoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerMenu(CancellationToken ct)
        => Ok(await repositorio.ObtenerMenuAsync(ct));

    /// <summary>Recibe una respuesta de un bloque de formulario dinámico.</summary>
    [HttpPost("formularios/{bloqueId:int}/respuestas")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EnviarRespuestaFormulario(
        int bloqueId, [FromBody] JsonElement datos, CancellationToken ct)
    {
        if (datos.ValueKind != JsonValueKind.Object || !datos.EnumerateObject().Any())
            return BadRequest(new { error = "El cuerpo debe ser un objeto JSON con los campos del formulario." });

        var guardada = await repositorio.GuardarRespuestaFormularioAsync(bloqueId, datos, ct);
        return guardada ? NoContent() : NotFound();
    }
}
