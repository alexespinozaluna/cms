using System.Security.Claims;
using Cms.Api.Dtos;
using Cms.Auth.Jwt;
using Cms.Auth.Modelo;
using Cms.Erp.Personas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cms.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<Usuario> usuarios,
    IConsultaPersonasErp erp,
    IGeneradorJwt jwt) : ControllerBase
{
    /// <summary>
    /// Verificación previa al registro: valida que la persona exista en el ERP
    /// y que no esté ya registrada. Devuelve el nombre para autocompletar.
    /// </summary>
    [HttpPost("verificar-documento")]
    [ProducesResponseType(typeof(VerificacionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> VerificarDocumento(VerificarDocumentoRequest req, CancellationToken ct)
    {
        var (persona, error) = await ResolverPersonaDisponibleAsync(req.Documento, req.Tipo, ct);
        if (error is not null) return error;
        return Ok(new VerificacionResponse(persona!.Nombre, RolesDe(persona)));
    }

    /// <summary>Registro único: valida la persona en el ERP y crea su cuenta web.</summary>
    [HttpPost("registro")]
    [ProducesResponseType(typeof(AuthRespuesta), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Registrar(RegistroRequest req, CancellationToken ct)
    {
        var (persona, error) = await ResolverPersonaDisponibleAsync(req.Documento, req.Tipo, ct);
        if (error is not null) return error;

        var usuario = new Usuario
        {
            UserName = persona!.Cip.Length > 0 ? persona.Cip : (persona.NroDni ?? req.Documento),
            Email = req.Correo,
            IdAnexo = persona.IdAnexo,
            Cip = persona.Cip,
            NroDni = persona.NroDni,
            Telefono = req.Telefono,
            NombreCompleto = req.NombreCompleto ?? persona.Nombre,
        };
        var roles = RolesDe(persona);

        try
        {
            var creacion = await usuarios.CreateAsync(usuario, req.Password);
            if (!creacion.Succeeded)
            {
                // Doble envío que pasó la verificación previa: el índice único de
                // Identity (UserName) rechaza el segundo → 409 en vez de 400.
                if (creacion.Errors.Any(e => e.Code.Contains("Duplicate", StringComparison.OrdinalIgnoreCase)))
                    return Conflict(new { error = "Ya existe una cuenta para esta persona." });
                return BadRequest(new { errores = creacion.Errors.Select(e => e.Description) });
            }
            await usuarios.AddToRolesAsync(usuario, roles);
        }
        catch (DbUpdateException)
        {
            // Carrera contra el índice único de IdAnexo (doble clic simultáneo).
            return Conflict(new { error = "Ya existe una cuenta para esta persona." });
        }

        var (token, expira) = jwt.Generar(usuario, roles);
        return CreatedAtAction(nameof(Yo),
            new AuthRespuesta(token, expira, usuario.UserName!, usuario.NombreCompleto ?? "", roles));
    }

    /// <summary>Login por CIP/DNI + contraseña; sincroniza roles con el ERP en vivo.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthRespuesta), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Login(LoginRequest req, CancellationToken ct)
    {
        var doc = req.Usuario.Trim();
        var usuario = await usuarios.Users.FirstOrDefaultAsync(u => u.Cip == doc || u.NroDni == doc, ct);
        if (usuario is null || !await usuarios.CheckPasswordAsync(usuario, req.Password))
            return Unauthorized(new { error = "Credenciales inválidas." });

        var persona = await erp.BuscarPorDocumentoAsync(usuario.Cip ?? usuario.NroDni ?? doc, TipoDocumentoBusqueda.Ambos, ct);
        if (persona is null || !persona.TieneAlgunRol)
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Su acceso no está habilitado en el ERP." });

        var roles = await SincronizarRolesErpAsync(usuario, RolesDe(persona));
        var (token, expira) = jwt.Generar(usuario, roles);
        return Ok(new AuthRespuesta(token, expira, usuario.UserName!, usuario.NombreCompleto ?? "", roles));
    }

    /// <summary>Datos del usuario autenticado (para verificar el token).</summary>
    [HttpGet("yo")]
    [Authorize]
    public IActionResult Yo() => Ok(new
    {
        usuario = User.Identity?.Name,
        idAnexo = User.FindFirstValue("id_anexo"),
        cip = User.FindFirstValue("cip"),
        roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value),
    });

    /// <summary>
    /// Resuelve la persona del ERP y valida que exista con algún rol (422) y que
    /// no esté ya registrada en PostgreSQL (409). Centraliza la regla (DRY) para
    /// verificar-documento y registro.
    /// </summary>
    private async Task<(PersonaErp? persona, IActionResult? error)> ResolverPersonaDisponibleAsync(
        string documento, int tipo, CancellationToken ct)
    {
        var persona = await erp.BuscarPorDocumentoAsync(documento, (TipoDocumentoBusqueda)tipo, ct);
        if (persona is null || !persona.TieneAlgunRol)
            return (null, UnprocessableEntity(
                new { error = "El CIP/DNI no está registrado en el ERP o no tiene un rol habilitado." }));

        if (await usuarios.Users.AnyAsync(u => u.IdAnexo == persona.IdAnexo, ct))
            return (null, Conflict(new { error = "Ya existe una cuenta para esta persona. Inicia sesión." }));

        return (persona, null);
    }

    private static List<string> RolesDe(PersonaErp p)
    {
        var roles = new List<string>();
        if (p.EsCliente) roles.Add(Roles.Cliente);
        if (p.EsProveedor) roles.Add(Roles.Proveedor);
        if (p.EsConcesionario) roles.Add(Roles.Concesionario);
        if (p.EsTrabajador) roles.Add(Roles.Trabajador);
        return roles;
    }

    /// <summary>Deja los roles derivados del ERP igual a <paramref name="deseados"/>,
    /// sin tocar los roles internos del CMS (Editor/Admin). Devuelve el conjunto final.</summary>
    private async Task<List<string>> SincronizarRolesErpAsync(Usuario usuario, List<string> deseados)
    {
        var actuales = await usuarios.GetRolesAsync(usuario);
        var quitar = actuales.Where(r => Roles.DerivadosErp.Contains(r) && !deseados.Contains(r)).ToList();
        var agregar = deseados.Where(r => !actuales.Contains(r)).ToList();

        if (quitar.Count > 0) await usuarios.RemoveFromRolesAsync(usuario, quitar);
        if (agregar.Count > 0) await usuarios.AddToRolesAsync(usuario, agregar);

        return actuales.Except(quitar).Union(agregar).ToList();
    }
}
