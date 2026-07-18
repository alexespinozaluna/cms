using System.ComponentModel.DataAnnotations;

namespace Cms.Api.Dtos;

/// <summary>Registro único: la persona debe existir en el ERP (Anexo) con algún rol.</summary>
public sealed class RegistroRequest
{
    [Required, RegularExpression(@"^\d{8,9}$", ErrorMessage = "El CIP/DNI debe tener 8 o 9 dígitos.")]
    public string Documento { get; set; } = "";

    [Required, EmailAddress]
    public string Correo { get; set; } = "";

    [Phone]
    public string? Telefono { get; set; }

    [Required, MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    public string Password { get; set; } = "";

    [MaxLength(150)]
    public string? NombreCompleto { get; set; }
}

/// <summary>Login único por usuario (CIP o DNI) + contraseña.</summary>
public sealed class LoginRequest
{
    [Required]
    public string Usuario { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public sealed record AuthRespuesta(
    string Token, DateTime Expira, string Usuario, string Nombre, IReadOnlyList<string> Roles);
