using System.Text.RegularExpressions;

namespace Cms.Erp.Personas;

/// <summary>
/// Implementación de desarrollo SIN ERP. Acepta un CodUsuario de 9 dígitos
/// (militar/trabajador → Cliente; último dígito 7 → +Trabajador) o de 6 dígitos
/// (proveedor/concesionario → Proveedor; último dígito impar → +Concesionario),
/// para poder probar combinaciones de roles.
/// TODO: en producción se usa <see cref="ConsultaPersonasErpSql"/>.
/// </summary>
public sealed partial class ConsultaPersonasErpStub : IConsultaPersonasErp
{
    public Task<PersonaErp?> BuscarPorDocumentoAsync(
        string documento, TipoDocumentoBusqueda tipo = TipoDocumentoBusqueda.Ambos, CancellationToken ct = default)
    {
        var doc = (documento ?? string.Empty).Trim();
        if (!FormatoCodUsuario().IsMatch(doc))
            return Task.FromResult<PersonaErp?>(null);

        var ultimo = doc[^1] - '0';
        var esNueveDigitos = doc.Length == 9;
        var persona = new PersonaErp
        {
            IdAnexo = int.Parse(doc),
            Cip = doc,
            Nombre = "Persona de prueba (ERP simulado)",
            TipoDocumento = "CIP",
            EsCliente = esNueveDigitos,
            EsTrabajador = esNueveDigitos && ultimo == 7,
            EsProveedor = !esNueveDigitos,
            EsConcesionario = !esNueveDigitos && ultimo % 2 == 1,
        };
        return Task.FromResult<PersonaErp?>(persona);
    }

    [GeneratedRegex(@"^(\d{6}|\d{9})$")]
    private static partial Regex FormatoCodUsuario();
}
