using Microsoft.AspNetCore.Identity;

namespace Cms.Auth.Modelo;

/// <summary>
/// Cuenta web del portal (concepto "AnexoWeb") en PostgreSQL, vinculada a la
/// persona del ERP. Las credenciales viven aquí; los roles se derivan de los
/// flags del ERP en cada login. El login/registro es por <see cref="CodUsuario"/>
/// (CIP). Correo único. Email/UserName los provee IdentityUser.
/// </summary>
public sealed class Usuario : IdentityUser
{
    /// <summary>Código de usuario = CIP (Anexo.CodAnexo). Coincide con UserName.</summary>
    public string? CodUsuario { get; set; }

    public string? Telefono { get; set; }
    public string? NroDni { get; set; }
    public string? NroRuc { get; set; }
    public string? TipoDoc { get; set; }
    public string? NombreCompleto { get; set; }

    /// <summary>Referencia a la persona en el ERP (Anexo.IdAnexo). Único cuando
    /// existe; null para usuarios internos del CMS (Editor/Admin).</summary>
    public int? IdUserRef { get; set; }

    /// <summary>Referencia al usuario del ERP de escritorio (Anexo.IdSistemaUsuario).</summary>
    public int? IdUserSistema { get; set; }

    /// <summary>True para cuentas con contraseña temporal (cambio obligatorio al primer login).</summary>
    public bool CambioPasswordPendiente { get; set; }
}
