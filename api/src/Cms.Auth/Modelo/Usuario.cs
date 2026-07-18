using Microsoft.AspNetCore.Identity;

namespace Cms.Auth.Modelo;

/// <summary>
/// Cuenta web del portal (concepto "AnexoWeb") en PostgreSQL, vinculada a la
/// persona del ERP por <see cref="IdAnexo"/>. Las credenciales viven aquí; los
/// roles se derivan de los flags del ERP en cada login. El login es por CIP/DNI.
/// </summary>
public sealed class Usuario : IdentityUser
{
    /// <summary>Vínculo a Anexo (ERP). Fuente de verdad de la identidad.</summary>
    public int IdAnexo { get; set; }

    public string? Cip { get; set; }
    public string? NroDni { get; set; }
    public string? Telefono { get; set; }
    public string? NombreCompleto { get; set; }

    /// <summary>True para cuentas con contraseña temporal (cambio obligatorio al primer login).</summary>
    public bool CambioPasswordPendiente { get; set; }
}
