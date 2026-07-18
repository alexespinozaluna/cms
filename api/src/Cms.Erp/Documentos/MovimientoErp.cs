namespace Cms.Erp.Documentos;

/// <summary>
/// Fila de un documento del ERP (compra/venta, estado de cuenta, liquidación).
/// Forma común a todas las vistas transaccionales del portal. Total/Pagado/Saldo
/// vienen con signo según EsInverso (el SP ya lo aplica).
/// </summary>
public sealed class MovimientoErp
{
    public int IdDocumento { get; init; }
    public string TipoDoc { get; init; } = "";
    public DateTime FechaEmision { get; init; }
    public string NroSerieDoc { get; init; } = "";
    public string? NomFormaVenta { get; init; }
    public string? NomEstado { get; init; }
    public bool EsInverso { get; init; }
    public decimal Total { get; init; }
    public decimal Pagado { get; init; }
    public decimal Saldo { get; init; }
    public string? Referencia { get; init; }
}
