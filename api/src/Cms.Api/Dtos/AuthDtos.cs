using System.ComponentModel.DataAnnotations;

namespace Cms.Api.Dtos;

// CodUsuario = CIP (Anexo.CodAnexo): 9 dígitos (militares/trabajadores) o
// 6 dígitos (proveedores/concesionarios).
file static class Reglas
{
    public const string CodUsuario = @"^(\d{6}|\d{9})$";
    public const string CodUsuarioMsg = "El código de usuario debe tener 6 o 9 dígitos.";
}

/// <summary>Verificación previa al registro: existe en el ERP y no está ya registrado.</summary>
public sealed class VerificarDocumentoRequest
{
    [Required, RegularExpression(Reglas.CodUsuario, ErrorMessage = Reglas.CodUsuarioMsg)]
    public string CodUsuario { get; set; } = "";
}

/// <summary>Datos que se muestran/autocompletan cuando la persona es válida.</summary>
public sealed record VerificacionResponse(string Nombre, IReadOnlyList<string> Roles);

/// <summary>Registro único: la persona debe existir en el ERP (Anexo) con algún rol.</summary>
public sealed class RegistroRequest
{
    [Required, RegularExpression(Reglas.CodUsuario, ErrorMessage = Reglas.CodUsuarioMsg)]
    public string CodUsuario { get; set; } = "";

    [Required, EmailAddress]
    public string Correo { get; set; } = "";

    [Phone]
    public string? Telefono { get; set; }

    [Required, MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    public string Password { get; set; } = "";

    [MaxLength(150)]
    public string? NombreCompleto { get; set; }
}

/// <summary>Login único por CodUsuario (CIP) + contraseña.</summary>
public sealed class LoginRequest
{
    [Required]
    public string CodUsuario { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public sealed record AuthRespuesta(
    string Token, DateTime Expira, string Usuario, string Nombre, IReadOnlyList<string> Roles);
