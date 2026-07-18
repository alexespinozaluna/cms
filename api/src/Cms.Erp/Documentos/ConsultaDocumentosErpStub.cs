namespace Cms.Erp.Documentos;

/// <summary>Implementación de desarrollo SIN ERP: devuelve movimientos de muestra.</summary>
public sealed class ConsultaDocumentosErpStub : IConsultaDocumentosErp
{
    public Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => Muestra("BOLETA", "FACTURA");

    public Task<IReadOnlyList<MovimientoErp>> EstadoCuentaAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => Muestra("N/D", "RECIBO");

    public Task<IReadOnlyList<MovimientoErp>> LiquidacionPagosAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => Muestra("LIQ", "ADELANTO");

    public Task<IReadOnlyList<MovimientoErp>> MisFacturasAsync(int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
        => Muestra("FACTURA", "N/C");

    private static Task<IReadOnlyList<MovimientoErp>> Muestra(string tipo1, string tipo2)
    {
        var hoy = DateTime.Today;
        IReadOnlyList<MovimientoErp> filas =
        [
            new() { IdDocumento = 1, TipoDoc = tipo1, FechaEmision = hoy.AddDays(-3),
                    NroSerieDoc = "001-000123", NomFormaVenta = "CONTADO", NomEstado = "PAGADO",
                    Total = 84.50m, Pagado = 84.50m, Saldo = 0m, Referencia = "OV-5567" },
            new() { IdDocumento = 2, TipoDoc = tipo2, FechaEmision = hoy.AddDays(-12),
                    NroSerieDoc = "001-000045", NomFormaVenta = "CREDITO", NomEstado = "PENDIENTE",
                    Total = 1299.00m, Pagado = 300.00m, Saldo = 999.00m, Referencia = "OV-5540" },
        ];
        return Task.FromResult(filas);
    }
}
