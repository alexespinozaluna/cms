using System.Text.Json;
using Cms.Api.Dtos;
using Cms.Auth.Modelo;
using Cms.Content.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

/// <summary>Tipos de bloque (metadata) y bloques de una página. Solo Editor/Admin.</summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = Roles.Editor + "," + Roles.Admin)]
public sealed class AdminBloquesController(IAdminBloquesRepository repo) : ControllerBase
{
    [HttpGet("tipos-bloque")]
    public async Task<IActionResult> Tipos(CancellationToken ct)
    {
        var tipos = await repo.ListarTiposAsync(ct);
        return Ok(tipos.Select(t => new
        {
            t.Id, t.Codigo, t.Nombre, t.Descripcion,
            esquemaCampos = JsonSerializer.Deserialize<JsonElement>(t.EsquemaCampos),
        }));
    }

    [HttpGet("paginas/{paginaId:int}/bloques")]
    public async Task<IActionResult> Listar(int paginaId, CancellationToken ct)
        => Ok((await repo.ListarPorPaginaAsync(paginaId, ct)).Select(ADto));

    [HttpGet("bloques/{id:int}")]
    public async Task<IActionResult> Obtener(int id, CancellationToken ct)
        => await repo.ObtenerAsync(id, ct) is { } b ? Ok(ADto(b)) : NotFound();

    [HttpPost("paginas/{paginaId:int}/bloques")]
    public async Task<IActionResult> Crear(int paginaId, BloqueCrearRequest req, CancellationToken ct)
    {
        var tipo = await repo.ObtenerTipoAsync(req.TipoBloqueId, ct);
        if (tipo is null) return BadRequest(new { error = "Tipo de bloque inválido." });
        if (!SlugsReservados.EstadosValidos.Contains(req.Estado)) return BadRequest(new { error = "Estado inválido." });
        if (ValidarContenido(tipo.EsquemaCampos, req.Contenido) is { } err) return BadRequest(new { error = err });

        var id = await repo.CrearAsync(paginaId, req.TipoBloqueId, req.Contenido.GetRawText(), req.Estado, ct);
        return CreatedAtAction(nameof(Obtener), new { id }, new { id });
    }

    [HttpPut("bloques/{id:int}")]
    public async Task<IActionResult> Actualizar(int id, BloqueActualizarRequest req, CancellationToken ct)
    {
        var bloque = await repo.ObtenerAsync(id, ct);
        if (bloque is null) return NotFound();
        var tipo = await repo.ObtenerTipoAsync(bloque.TipoBloqueId, ct);
        if (!SlugsReservados.EstadosValidos.Contains(req.Estado)) return BadRequest(new { error = "Estado inválido." });
        if (tipo is not null && ValidarContenido(tipo.EsquemaCampos, req.Contenido) is { } err)
            return BadRequest(new { error = err });

        await repo.ActualizarAsync(id, req.Contenido.GetRawText(), req.Estado, req.VigenciaDesde, req.VigenciaHasta, ct);
        return NoContent();
    }

    [HttpPut("paginas/{paginaId:int}/bloques/orden")]
    public async Task<IActionResult> Reordenar(int paginaId, ReordenarBloquesRequest req, CancellationToken ct)
    {
        await repo.ReordenarAsync(paginaId, req.Ids, ct);
        return NoContent();
    }

    [HttpDelete("bloques/{id:int}")]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
        => await repo.EliminarAsync(id, ct) ? NoContent() : NotFound();

    private static object ADto(BloqueAdmin b) => new
    {
        b.Id, b.PaginaId, b.TipoBloqueId, b.TipoCodigo, b.TipoNombre, b.Orden, b.Estado,
        b.VigenciaDesde, b.VigenciaHasta,
        contenido = JsonSerializer.Deserialize<JsonElement>(b.Contenido),
    };

    /// <summary>Validación mínima del contenido contra el esquema: los campos
    /// requeridos (nivel superior) deben estar presentes y no vacíos.</summary>
    private static string? ValidarContenido(string esquemaJson, JsonElement contenido)
    {
        if (contenido.ValueKind != JsonValueKind.Object)
            return "El contenido debe ser un objeto.";

        using var esquema = JsonDocument.Parse(esquemaJson);
        foreach (var campo in esquema.RootElement.EnumerateArray())
        {
            if (!campo.TryGetProperty("requerido", out var req) || !req.GetBoolean()) continue;
            var nombre = campo.GetProperty("nombre").GetString()!;
            if (!contenido.TryGetProperty(nombre, out var valor) || EsVacio(valor))
                return $"El campo '{campo.GetProperty("etiqueta").GetString() ?? nombre}' es obligatorio.";
        }
        return null;
    }

    private static bool EsVacio(JsonElement v) => v.ValueKind switch
    {
        JsonValueKind.Null or JsonValueKind.Undefined => true,
        JsonValueKind.String => string.IsNullOrWhiteSpace(v.GetString()),
        JsonValueKind.Array => v.GetArrayLength() == 0,
        _ => false,
    };
}
