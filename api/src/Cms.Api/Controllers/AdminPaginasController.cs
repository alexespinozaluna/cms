using Cms.Api.Dtos;
using Cms.Auth.Modelo;
using Cms.Content.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

/// <summary>Gestión de páginas del CMS (panel /admin). Solo Editor/Admin.</summary>
[ApiController]
[Route("api/admin/paginas")]
[Authorize(Roles = Roles.Editor + "," + Roles.Admin)]
public sealed class AdminPaginasController(IAdminPaginasRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
        => Ok(await repo.ListarAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id, CancellationToken ct)
        => await repo.ObtenerAsync(id, ct) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Crear(PaginaGuardarRequest req, CancellationToken ct)
    {
        if (Validar(req) is { } error) return error;
        if (await repo.SlugExisteAsync(req.Slug, null, ct))
            return Conflict(new { error = "Ya existe una página con ese slug." });

        var id = await repo.CrearAsync(ADominio(req), User.Identity?.Name ?? "admin", ct);
        return CreatedAtAction(nameof(Obtener), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, PaginaGuardarRequest req, CancellationToken ct)
    {
        if (Validar(req) is { } error) return error;
        if (await repo.ObtenerAsync(id, ct) is null) return NotFound();
        if (await repo.SlugExisteAsync(req.Slug, id, ct))
            return Conflict(new { error = "Ya existe otra página con ese slug." });

        var p = ADominio(req);
        p.Id = id;
        await repo.ActualizarAsync(p, ct);
        return NoContent();
    }

    [HttpPatch("{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, CambiarEstadoRequest req, CancellationToken ct)
    {
        if (!SlugsReservados.EstadosValidos.Contains(req.Estado))
            return BadRequest(new { error = "Estado inválido." });
        return await repo.CambiarEstadoAsync(id, req.Estado, ct) ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        try
        {
            return await repo.EliminarAsync(id, ct) ? NoContent() : NotFound();
        }
        catch (Npgsql.PostgresException)
        {
            // FK RESTRICT (respuestas de formularios): mejor archivar.
            return Conflict(new { error = "No se puede eliminar: tiene datos asociados. Archívala en su lugar." });
        }
    }

    private BadRequestObjectResult? Validar(PaginaGuardarRequest req)
    {
        if (SlugsReservados.EsReservado(req.Slug))
            return BadRequest(new { error = $"El slug '{req.Slug}' está reservado por el sistema." });
        if (!SlugsReservados.EstadosValidos.Contains(req.Estado))
            return BadRequest(new { error = "Estado inválido." });
        if (req.VigenciaDesde is { } d && req.VigenciaHasta is { } h && d > h)
            return BadRequest(new { error = "La vigencia 'desde' no puede ser mayor que 'hasta'." });
        return null;
    }

    private static PaginaAdmin ADominio(PaginaGuardarRequest r) => new()
    {
        Slug = r.Slug.Trim(),
        Titulo = r.Titulo.Trim(),
        DescripcionSeo = r.DescripcionSeo,
        Plantilla = string.IsNullOrWhiteSpace(r.Plantilla) ? "default" : r.Plantilla,
        Estado = r.Estado,
        VigenciaDesde = r.VigenciaDesde,
        VigenciaHasta = r.VigenciaHasta,
    };
}
