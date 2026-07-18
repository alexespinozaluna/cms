using Microsoft.AspNetCore.Identity;

namespace Cms.Auth.Modelo;

/// <summary>
/// Usuario de Identity extendido con el vínculo al ERP (cliente) o al proveedor.
/// </summary>
public sealed class Usuario : IdentityUser
{
    /// <summary>Código de cliente en el ERP (rol Cliente); null para otros roles.</summary>
    public string? CodigoClienteErp { get; set; }

    /// <summary>Código de proveedor (rol Proveedor); null para otros roles.</summary>
    public string? CodigoProveedor { get; set; }

    public string? NombreCompleto { get; set; }

    /// <summary>True para proveedores con contraseña temporal (cambio obligatorio al primer login).</summary>
    public bool CambioPasswordPendiente { get; set; }
}
