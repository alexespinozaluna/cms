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
        var (persona, error) = await ResolverPersonaDisponibleAsync(req.CodUsuario, ct);
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
        var (persona, error) = await ResolverPersonaDisponibleAsync(req.CodUsuario, ct);
        if (error is not null) return error;
        // 'persona' garantizado no-nulo cuando error es null
        var usuario = new Usuario
        {
            UserName = persona!.Cip,
            CodUsuario = persona.Cip,
            Email = req.Correo,
            Telefono = req.Telefono,
            NroDni = persona.NroDni,
            NroRuc = persona.Ruc,
            TipoDoc = persona.TipoDocumento,
            IdUserRef = persona.IdAnexo,
            IdUserSistema = persona.IdSistemaUsuario,
            NombreCompleto = req.NombreCompleto ?? persona.Nombre,
        };
        var roles = RolesDe(persona);

        try
        {
            var creacion = await usuarios.CreateAsync(usuario, req.Password);
            if (!creacion.Succeeded)
            {
                // Correo ya usado por OTRA persona (Identity exige correo único).
                if (creacion.Errors.Any(e => e.Code == "DuplicateEmail"))
                    return Conflict(new { error = "El correo ya está registrado con otra cuenta." });
                // Doble envío que pasó la verificación previa: mismo CodUsuario.
                if (creacion.Errors.Any(e => e.Code == "DuplicateUserName"))
                    return Conflict(new { error = "Ya existe una cuenta para este usuario." });
                return BadRequest(new { errores = creacion.Errors.Select(e => e.Description) });
            }
            await usuarios.AddToRolesAsync(usuario, roles);
        }
        catch (DbUpdateException)
        {
            // Carrera contra el índice único de IdUserRef (doble clic simultáneo).
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
        var cod = req.CodUsuario.Trim();
        var usuario = await usuarios.Users.FirstOrDefaultAsync(u => u.CodUsuario == cod, ct);
        if (usuario is null || !await usuarios.CheckPasswordAsync(usuario, req.Password))
            return Unauthorized(new { error = "Credenciales inválidas." });

        List<string> roles;
        if (usuario.IdUserRef.HasValue)
        {
            // Cuenta del ERP: relee los flags en vivo y sincroniza (conserva internos).
            var persona = await erp.BuscarPorDocumentoAsync(usuario.CodUsuario ?? cod, TipoDocumentoBusqueda.Cip, ct);
            var rolesErp = persona is not null && persona.TieneAlgunRol ? RolesDe(persona) : new List<string>();
            roles = await SincronizarRolesErpAsync(usuario, rolesErp);
        }
        else
        {
            // Cuenta interna (Admin/Editor): sin ERP.
            roles = (await usuarios.GetRolesAsync(usuario)).ToList();
        }

        if (roles.Count == 0)
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Su acceso no está habilitado." });

        var (token, expira) = jwt.Generar(usuario, roles);
        return Ok(new AuthRespuesta(token, expira, usuario.UserName!, usuario.NombreCompleto ?? "", roles));
    }

    /// <summary>Datos del usuario autenticado (para verificar el token).</summary>
    [HttpGet("yo")]
    [Authorize]
    public IActionResult Yo() => Ok(new
    {
        usuario = User.Identity?.Name,
        idUserRef = User.FindFirstValue("id_user_ref"),
        codUsuario = User.FindFirstValue("cod_usuario"),
        roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value),
    });

    /// <summary>
    /// Resuelve la persona del ERP y valida que exista con algún rol (422) y que
    /// no esté ya registrada en PostgreSQL (409). Centraliza la regla (DRY) para
    /// verificar-documento y registro.
    /// </summary>
    private async Task<(PersonaErp? persona, IActionResult? error)> ResolverPersonaDisponibleAsync(
        string codUsuario, CancellationToken ct)
    {
        var persona = await erp.BuscarPorDocumentoAsync(codUsuario, TipoDocumentoBusqueda.Cip, ct);
        if (persona is null || !persona.TieneAlgunRol)
            return (null, UnprocessableEntity(
                new { error = "El CIP/DNI no está registrado en el ERP o no tiene un rol habilitado." }));

        if (await usuarios.Users.AnyAsync(u => u.IdUserRef == persona.IdAnexo, ct))
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
