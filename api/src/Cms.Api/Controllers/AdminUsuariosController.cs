using System.ComponentModel.DataAnnotations;
using Cms.Auth.Modelo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Cms.Api.Controllers;

public sealed class RolesInternosRequest
{
    /// <summary>Subconjunto de {Editor, Admin}.</summary>
    public string[] Roles { get; set; } = [];
}

public sealed class CrearInternoRequest
{
    [Required, MaxLength(50)] public string Usuario { get; set; } = "";
    [Required, EmailAddress] public string Correo { get; set; } = "";
    [Required, MinLength(8)] public string Password { get; set; } = "";
    public string[] Roles { get; set; } = [];
}

/// <summary>Gestión de usuarios y roles internos (solo Admin).</summary>
[ApiController]
[Route("api/admin/usuarios")]
[Authorize(Roles = Roles.Admin)]
public sealed class AdminUsuariosController(UserManager<Usuario> usuarios) : ControllerBase
{
    private static readonly string[] Internos = [Roles.Editor, Roles.Admin];

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var salida = new List<object>();
        foreach (var u in usuarios.Users.OrderBy(x => x.UserName).ToList())
        {
            var roles = await usuarios.GetRolesAsync(u);
            salida.Add(new
            {
                id = u.Id,
                usuario = u.UserName,
                correo = u.Email,
                nombre = u.NombreCompleto,
                esInterno = u.IdUserRef == null,
                roles,
            });
        }
        return Ok(salida);
    }

    [HttpPut("{id}/roles-internos")]
    public async Task<IActionResult> RolesInternos(string id, RolesInternosRequest req)
    {
        var u = await usuarios.FindByIdAsync(id);
        if (u is null) return NotFound();

        var deseados = req.Roles.Where(r => Internos.Contains(r)).Distinct().ToList();
        var actuales = await usuarios.GetRolesAsync(u);
        var actualesInternos = actuales.Where(Internos.Contains).ToList();

        var quitar = actualesInternos.Except(deseados).ToList();
        var agregar = deseados.Except(actualesInternos).ToList();
        if (quitar.Count > 0) await usuarios.RemoveFromRolesAsync(u, quitar);
        if (agregar.Count > 0) await usuarios.AddToRolesAsync(u, agregar);
        return NoContent();
    }

    [HttpPost("interno")]
    public async Task<IActionResult> CrearInterno(CrearInternoRequest req)
    {
        if (await usuarios.FindByNameAsync(req.Usuario) is not null)
            return Conflict(new { error = "Ya existe un usuario con ese nombre." });

        var u = new Usuario
        {
            UserName = req.Usuario.Trim(),
            CodUsuario = req.Usuario.Trim(),
            Email = req.Correo,
            NombreCompleto = req.Usuario.Trim(),
            CambioPasswordPendiente = true,
        };
        var creacion = await usuarios.CreateAsync(u, req.Password);
        if (!creacion.Succeeded)
        {
            if (creacion.Errors.Any(e => e.Code == "DuplicateEmail"))
                return Conflict(new { error = "El correo ya está registrado con otra cuenta." });
            return BadRequest(new { errores = creacion.Errors.Select(e => e.Description) });
        }

        var roles = req.Roles.Where(r => Internos.Contains(r)).Distinct().ToList();
        if (roles.Count > 0) await usuarios.AddToRolesAsync(u, roles);
        return CreatedAtAction(nameof(Listar), new { });
    }
}
