namespace Cms.Erp.Documentos;

/// <summary>Consultas de solo lectura de documentos del ERP para el portal.</summary>
public interface IConsultaDocumentosErp
{
    /// <summary>"Mis compras": documentos de compra-venta del titular en un rango.</summary>
    Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default);

    /// <summary>"Estado de cuenta": documentos de cuenta corriente del titular.</summary>
    Task<IReadOnlyList<MovimientoErp>> EstadoCuentaAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default);

    /// <summary>"Liquidación de pagos": documentos VA del concesionario.</summary>
    Task<IReadOnlyList<MovimientoErp>> LiquidacionPagosAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default);

    /// <summary>"Mis facturas": facturas del proveedor (origen a confirmar).</summary>
    Task<IReadOnlyList<MovimientoErp>> MisFacturasAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default);
}
