using System.ComponentModel.DataAnnotations;

namespace Cms.Api.Dtos;

/// <summary>Registro de cliente: requiere CIP/DNI existente en el ERP.</summary>
public sealed class RegistroClienteRequest
{
    [Required, RegularExpression(@"^\d{8,9}$", ErrorMessage = "El CIP/DNI debe tener 8 o 9 dígitos.")]
    public string CipDni { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    public string Password { get; set; } = "";

    [MaxLength(150)]
    public string? NombreCompleto { get; set; }
}

public sealed class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public sealed record AuthRespuesta(string Token, DateTime Expira, string Email, IReadOnlyList<string> Roles);
