namespace Cms.Erp.Personas;

/// <summary>
/// Persona del ERP (tabla Anexo) con sus flags de rol. El ERP es la fuente de
/// verdad y se consulta solo lectura; el portal decide las opciones según estos
/// flags (pueden combinarse: p.ej. cliente y proveedor a la vez).
/// </summary>
public sealed class PersonaErp
{
    public int IdAnexo { get; init; }
    public string Cip { get; init; } = "";           // CodAnexo → CodUsuario
    public string Nombre { get; init; } = "";         // NomAnexo
    public string? Direccion { get; init; }
    public string? TipoDocumento { get; init; }
    public string? NroDni { get; init; }              // Documento
    public string? Ruc { get; init; }

    /// <summary>Referencia al usuario del ERP de escritorio (Anexo.IdSistemaUsuario).</summary>
    public int? IdSistemaUsuario { get; init; }

    public bool EsCliente { get; init; }
    public bool EsProveedor { get; init; }
    public bool EsConcesionario { get; init; }
    public bool EsTrabajador { get; init; }           // solo si además EsDomiciliado

    public bool TieneAlgunRol => EsCliente || EsProveedor || EsConcesionario || EsTrabajador;
}
