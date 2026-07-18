namespace Cms.Erp.Personas;

/// <summary>
/// Consulta de solo lectura al ERP para resolver la identidad y los roles de
/// una persona a partir de su CIP o DNI.
/// </summary>
public interface IConsultaPersonasErp
{
    /// <summary>
    /// Busca por CodAnexo (CIP) y/o Documento (DNI) según <paramref name="tipo"/>.
    /// Devuelve la persona solo si está activa y tiene al menos un rol; null si no.
    /// </summary>
    Task<PersonaErp?> BuscarPorDocumentoAsync(
        string documento,
        TipoDocumentoBusqueda tipo = TipoDocumentoBusqueda.Ambos,
        CancellationToken ct = default);
}
