namespace Cms.Erp.Clientes;

/// <summary>
/// Datos mínimos de un cliente del ERP necesarios para vincular la cuenta.
/// El ERP es la fuente de verdad; el portal solo lo consulta (solo lectura).
/// </summary>
public sealed record ClienteErp(string CodigoCliente, string NombreCompleto);
