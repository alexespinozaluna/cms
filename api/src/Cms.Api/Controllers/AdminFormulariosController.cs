using System.Text.Json;
using ClosedXML.Excel;
using Cms.Auth.Modelo;
using Cms.Content.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

/// <summary>Bandeja de respuestas de los bloques de formulario. Solo Editor/Admin.</summary>
[ApiController]
[Route("api/admin/formularios")]
[Authorize(Roles = Roles.Editor + "," + Roles.Admin)]
public sealed class AdminFormulariosController(IAdminFormulariosRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
        => Ok(await repo.ListarFormulariosAsync(ct));

    [HttpGet("{bloqueId:int}/respuestas")]
    public async Task<IActionResult> Respuestas(int bloqueId, CancellationToken ct)
    {
        var filas = await repo.ListarRespuestasAsync(bloqueId, ct);
        return Ok(filas.Select(r => new
        {
            r.Id,
            r.CreadoEn,
            datos = JsonSerializer.Deserialize<JsonElement>(r.Datos),
        }));
    }

    [HttpGet("{bloqueId:int}/respuestas/excel")]
    public async Task<IActionResult> Excel(int bloqueId, CancellationToken ct)
    {
        var filas = await repo.ListarRespuestasAsync(bloqueId, ct);

        var registros = filas.Select(r =>
        {
            var dict = new Dictionary<string, string>();
            using var d = JsonDocument.Parse(r.Datos);
            foreach (var p in d.RootElement.EnumerateObject())
                dict[p.Name] = p.Value.ToString();
            return (r.CreadoEn, dict);
        }).ToList();

        var claves = registros.SelectMany(x => x.dict.Keys).Distinct().ToList();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Respuestas");
        ws.Cell(1, 1).Value = "Fecha";
        for (var c = 0; c < claves.Count; c++) ws.Cell(1, c + 2).Value = claves[c];
        ws.Row(1).Style.Font.Bold = true;

        var fila = 2;
        foreach (var (fecha, dict) in registros)
        {
            ws.Cell(fila, 1).Value = fecha;
            for (var c = 0; c < claves.Count; c++)
                if (dict.TryGetValue(claves[c], out var v)) ws.Cell(fila, c + 2).Value = v;
            fila++;
        }
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return File(ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"respuestas-formulario-{bloqueId}.xlsx");
    }
}
