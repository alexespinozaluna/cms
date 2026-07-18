using System.Text.RegularExpressions;

namespace Cms.Erp.Personas;

/// <summary>
/// Implementación de desarrollo SIN ERP. Acepta documentos de 8-9 dígitos y
/// deriva los flags del último dígito para poder probar combinaciones de roles:
///   base: Cliente · último dígito par: +Proveedor · 7: +Trabajador · 9: +Concesionario.
/// El <paramref name="tipo"/> no altera el resultado en el stub (solo valida formato).
/// TODO: en producción se usa <see cref="ConsultaPersonasErpSql"/>.
/// </summary>
public sealed partial class ConsultaPersonasErpStub : IConsultaPersonasErp
{
    public Task<PersonaErp?> BuscarPorDocumentoAsync(
        string documento, TipoDocumentoBusqueda tipo = TipoDocumentoBusqueda.Ambos, CancellationToken ct = default)
    {
        var doc = (documento ?? string.Empty).Trim();
        if (!FormatoDocumento().IsMatch(doc))
            return Task.FromResult<PersonaErp?>(null);

        var ultimo = doc[^1] - '0';
        var persona = new PersonaErp
        {
            IdAnexo = int.Parse(doc),
            Cip = doc,
            NroDni = doc,
            Nombre = "Persona de prueba (ERP simulado)",
            TipoDocumento = doc.Length == 8 ? "DNI" : "CIP",
            EsCliente = true,
            EsProveedor = ultimo % 2 == 0,
            EsTrabajador = ultimo == 7,
            EsConcesionario = ultimo == 9,
        };
        return Task.FromResult<PersonaErp?>(persona);
    }

    [GeneratedRegex(@"^\d{8,9}$")]
    private static partial Regex FormatoDocumento();
}
