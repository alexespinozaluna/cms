using System.Security.Claims;
using Cms.Auth.Modelo;
using Cms.Erp.Documentos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

/// <summary>
/// Vistas transaccionales del portal del usuario logueado. El titular se toma
/// del claim `id_user_ref` del token (nunca de un parámetro del cliente); cada
/// endpoint se autoriza por rol según la matriz del portal.
/// </summary>
[ApiController]
[Route("api/portal")]
[Authorize]
public sealed class PortalController(IConsultaDocumentosErp documentos) : ControllerBase
{
    /// <summary>Mis compras (Cliente / Proveedor / Trabajador).</summary>
    [HttpGet("mis-compras")]
    [Authorize(Roles = Roles.Ven.MisCompras)]
    [ProducesResponseType(typeof(IReadOnlyList<MovimientoErp>), StatusCodes.Status200OK)]
    public Task<IActionResult> MisCompras(DateTime? desde, DateTime? hasta, CancellationToken ct)
        => Movimientos(documentos.MisComprasAsync, desde, hasta, ct);

    /// <summary>Estado de cuenta (Cliente).</summary>
    [HttpGet("estado-cuenta")]
    [Authorize(Roles = Roles.Ven.EstadoCuenta)]
    [ProducesResponseType(typeof(IReadOnlyList<MovimientoErp>), StatusCodes.Status200OK)]
    public Task<IActionResult> EstadoCuenta(DateTime? desde, DateTime? hasta, CancellationToken ct)
        => Movimientos(documentos.EstadoCuentaAsync, desde, hasta, ct);

    /// <summary>Liquidación de pagos (Concesionario).</summary>
    [HttpGet("liquidacion-pagos")]
    [Authorize(Roles = Roles.Ven.LiquidacionPagos)]
    [ProducesResponseType(typeof(IReadOnlyList<MovimientoErp>), StatusCodes.Status200OK)]
    public Task<IActionResult> LiquidacionPagos(DateTime? desde, DateTime? hasta, CancellationToken ct)
        => Movimientos(documentos.LiquidacionPagosAsync, desde, hasta, ct);

    /// <summary>Mis facturas (Proveedor).</summary>
    [HttpGet("mis-facturas")]
    [Authorize(Roles = Roles.Ven.MisFacturas)]
    [ProducesResponseType(typeof(IReadOnlyList<MovimientoErp>), StatusCodes.Status200OK)]
    public Task<IActionResult> MisFacturas(DateTime? desde, DateTime? hasta, CancellationToken ct)
        => Movimientos(documentos.MisFacturasAsync, desde, hasta, ct);

    // Patrón común (DRY): toma el IdAnexo del token, normaliza el rango y consulta.
    private async Task<IActionResult> Movimientos(
        Func<int, DateTime, DateTime, CancellationToken, Task<IReadOnlyList<MovimientoErp>>> consulta,
        DateTime? desde, DateTime? hasta, CancellationToken ct)
    {
        if (!TryIdAnexo(out var idAnexo))
            return Forbid();

        var fin = (hasta ?? DateTime.Today).Date;
        var ini = (desde ?? fin.AddMonths(-2)).Date;
        var filas = await consulta(idAnexo, ini, fin.AddDays(1).AddSeconds(-1), ct);
        return Ok(filas);
    }

    private bool TryIdAnexo(out int idAnexo)
    {
        idAnexo = 0;
        var raw = User.FindFirstValue("id_user_ref");
        return int.TryParse(raw, out idAnexo) && idAnexo > 0;
    }
}
