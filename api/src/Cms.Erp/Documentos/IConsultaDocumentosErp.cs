namespace Cms.Erp.Documentos;

/// <summary>Consultas de solo lectura de documentos del ERP para el portal.</summary>
public interface IConsultaDocumentosErp
{
    /// <summary>"Mis compras": documentos de compra-venta del titular en un rango.</summary>
    Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default);
}
