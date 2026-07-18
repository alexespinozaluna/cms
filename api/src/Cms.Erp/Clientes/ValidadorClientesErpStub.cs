using System.Text.RegularExpressions;

namespace Cms.Erp.Clientes;

/// <summary>
/// Implementación de desarrollo SIN ERP: acepta documentos con formato válido
/// (DNI 8 dígitos o CIP 9 dígitos) y devuelve un código de cliente simulado.
/// TODO: reemplazar por la llamada al SP real de SQL Server cuando esté disponible.
/// </summary>
public sealed partial class ValidadorClientesErpStub : IValidadorClientesErp
{
    public Task<ClienteErp?> ValidarPorDocumentoAsync(string cipDni, CancellationToken ct = default)
    {
        var doc = (cipDni ?? string.Empty).Trim();
        ClienteErp? resultado = FormatoDocumento().IsMatch(doc)
            ? new ClienteErp(CodigoCliente: $"ERP-{doc}", NombreCompleto: "Cliente de prueba (ERP simulado)")
            : null;
        return Task.FromResult(resultado);
    }

    [GeneratedRegex(@"^\d{8,9}$")]
    private static partial Regex FormatoDocumento();
}
