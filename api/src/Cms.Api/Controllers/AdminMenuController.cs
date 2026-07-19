using System.ComponentModel.DataAnnotations;
using Cms.Auth.Modelo;
using Cms.Content.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

public sealed class MenuItemRequest
{
    public int? PadreId { get; set; }
    [Required, MaxLength(80)] public string Etiqueta { get; set; } = "";
    [Required, MaxLength(250)] public string Url { get; set; } = "";
    [Required] public string Tipo { get; set; } = "contenido";
    [Required] public string Estado { get; set; } = "publicado";
    public DateTime? VigenciaDesde { get; set; }
    public DateTime? VigenciaHasta { get; set; }
}

public sealed class ReordenarMenuRequest
{
    [Required] public int[] Ids { get; set; } = [];
}

/// <summary>Gestión del menú del sitio (menu_items). Solo Editor/Admin.</summary>
[ApiController]
[Route("api/admin/menu")]
[Authorize(Roles = Roles.Editor + "," + Roles.Admin)]
public sealed class AdminMenuController(IAdminMenuRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct) => Ok(await repo.ListarAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id, CancellationToken ct)
        => await repo.ObtenerAsync(id, ct) is { } m ? Ok(m) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Crear(MenuItemRequest req, CancellationToken ct)
    {
        if (Validar(req) is { } err) return err;
        var id = await repo.CrearAsync(ADominio(req), ct);
        return CreatedAtAction(nameof(Obtener), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, MenuItemRequest req, CancellationToken ct)
    {
        if (Validar(req) is { } err) return err;
        var m = ADominio(req);
        m.Id = id;
        return await repo.ActualizarAsync(m, ct) ? NoContent() : NotFound();
    }

    [HttpPut("orden")]
    public async Task<IActionResult> Reordenar(ReordenarMenuRequest req, CancellationToken ct)
    {
        await repo.ReordenarAsync(req.Ids, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
        => await repo.EliminarAsync(id, ct) ? NoContent() : NotFound();

    private static BadRequestObjectResult? Validar(MenuItemRequest r)
    {
        if (r.Tipo is not ("contenido" or "sistema"))
            return new BadRequestObjectResult(new { error = "Tipo inválido (contenido | sistema)." });
        if (!SlugsReservados.EstadosValidos.Contains(r.Estado))
            return new BadRequestObjectResult(new { error = "Estado inválido." });
        return null;
    }

    private static MenuItemAdmin ADominio(MenuItemRequest r) => new()
    {
        PadreId = r.PadreId,
        Etiqueta = r.Etiqueta.Trim(),
        Url = r.Url.Trim(),
        Tipo = r.Tipo,
        Estado = r.Estado,
        VigenciaDesde = r.VigenciaDesde,
        VigenciaHasta = r.VigenciaHasta,
    };
}
