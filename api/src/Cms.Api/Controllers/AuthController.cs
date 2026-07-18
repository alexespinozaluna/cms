using System.Security.Claims;
using Cms.Api.Dtos;
using Cms.Auth.Jwt;
using Cms.Auth.Modelo;
using Cms.Erp.Clientes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<Usuario> usuarios,
    IValidadorClientesErp erp,
    IGeneradorJwt jwt) : ControllerBase
{
    /// <summary>Registro de cliente: valida el CIP/DNI contra el ERP y crea la cuenta.</summary>
    [HttpPost("registro-cliente")]
    [ProducesResponseType(typeof(AuthRespuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> RegistrarCliente(RegistroClienteRequest req, CancellationToken ct)
    {
        var cliente = await erp.ValidarPorDocumentoAsync(req.CipDni, ct);
        if (cliente is null)
            return UnprocessableEntity(new { error = "El CIP/DNI no está registrado en el ERP." });

        var usuario = new Usuario
        {
            UserName = req.Email,
            Email = req.Email,
            CodigoClienteErp = cliente.CodigoCliente,
            NombreCompleto = req.NombreCompleto ?? cliente.NombreCompleto,
        };

        var creacion = await usuarios.CreateAsync(usuario, req.Password);
        if (!creacion.Succeeded)
            return BadRequest(new { errores = creacion.Errors.Select(e => e.Description) });

        await usuarios.AddToRoleAsync(usuario, Roles.Cliente);

        var (token, expira) = jwt.Generar(usuario, [Roles.Cliente]);
        return CreatedAtAction(nameof(Yo), new AuthRespuesta(token, expira, usuario.Email!, [Roles.Cliente]));
    }

    /// <summary>Login por email + contraseña; devuelve un JWT con los roles.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthRespuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequest req, CancellationToken ct)
    {
        var usuario = await usuarios.FindByEmailAsync(req.Email);
        if (usuario is null || !await usuarios.CheckPasswordAsync(usuario, req.Password))
            return Unauthorized(new { error = "Credenciales inválidas." });

        var roles = await usuarios.GetRolesAsync(usuario);
        var (token, expira) = jwt.Generar(usuario, roles);
        return Ok(new AuthRespuesta(token, expira, usuario.Email!, roles.ToList()));
    }

    /// <summary>Datos del usuario autenticado (para verificar el token).</summary>
    [HttpGet("yo")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Yo() => Ok(new
    {
        id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
        email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email"),
        roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value),
    });
}
