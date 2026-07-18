namespace Cms.Erp.Clientes;

/// <summary>
/// Valida que un CIP/DNI exista en el ERP y devuelve el código de cliente
/// para vincular la cuenta de Identity. La implementación real llamará a un
/// stored procedure de solo lectura en SQL Server.
/// </summary>
public interface IValidadorClientesErp
{
    /// <summary>Devuelve el cliente del ERP si el documento existe; null si no.</summary>
    Task<ClienteErp?> ValidarPorDocumentoAsync(string cipDni, CancellationToken ct = default);
}
