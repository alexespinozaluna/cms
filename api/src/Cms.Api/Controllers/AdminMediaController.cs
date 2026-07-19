using System.Text.RegularExpressions;
using Cms.Auth.Modelo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

/// <summary>Subida de imágenes del CMS a la carpeta /media. Solo Editor/Admin.</summary>
[ApiController]
[Route("api/admin/media")]
[Authorize(Roles = Roles.Editor + "," + Roles.Admin)]
public sealed partial class AdminMediaController : ControllerBase
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly string[] ExtensionesOk = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

    private readonly string _rutaMedia;

    public AdminMediaController(IConfiguration config, IWebHostEnvironment env)
    {
        _rutaMedia = Path.GetFullPath(config["Media:Ruta"] ?? "media", env.ContentRootPath);
    }

    [HttpPost]
    [RequestSizeLimit(MaxBytes + 1024)]
    public async Task<IActionResult> Subir(IFormFile? archivo, [FromForm] string? carpeta, CancellationToken ct)
    {
        if (archivo is null || archivo.Length == 0)
            return BadRequest(new { error = "No se recibió ningún archivo." });
        if (archivo.Length > MaxBytes)
            return BadRequest(new { error = "El archivo supera los 5 MB." });

        var ext = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (!ExtensionesOk.Contains(ext))
            return BadRequest(new { error = "Formato no permitido (jpg, png, webp, gif, svg)." });

        var sub = Sanitizar(carpeta ?? "contenido");
        var baseNombre = $"{Sanitizar(Path.GetFileNameWithoutExtension(archivo.FileName))}-{Guid.NewGuid():N}";
        var nombre = baseNombre[..Math.Min(48, baseNombre.Length)] + ext;

        var destinoDir = Path.Combine(_rutaMedia, sub);
        Directory.CreateDirectory(destinoDir);
        var destino = Path.Combine(destinoDir, nombre);

        await using (var fs = System.IO.File.Create(destino))
            await archivo.CopyToAsync(fs, ct);

        return Ok(new { url = $"/media/{sub}/{nombre}" });
    }

    private static string Sanitizar(string s)
    {
        var limpio = NoAlfanumerico().Replace(s.Trim().ToLowerInvariant(), "-").Trim('-');
        return string.IsNullOrEmpty(limpio) ? "contenido" : limpio;
    }

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex NoAlfanumerico();
}
