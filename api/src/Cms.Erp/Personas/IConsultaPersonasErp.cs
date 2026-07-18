namespace Cms.Erp.Personas;

/// <summary>
/// Consulta de solo lectura al ERP para resolver la identidad y los roles de
/// una persona a partir de su CIP o DNI.
/// </summary>
public interface IConsultaPersonasErp
{
    /// <summary>
    /// Busca por CodAnexo (CIP) o Documento (DNI). Devuelve la persona solo si
    /// está activa y tiene al menos un rol; null en caso contrario.
    /// </summary>
    Task<PersonaErp?> BuscarPorDocumentoAsync(string cipDni, CancellationToken ct = default);
}
