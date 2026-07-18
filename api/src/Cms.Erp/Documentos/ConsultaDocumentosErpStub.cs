namespace Cms.Erp.Documentos;

/// <summary>Implementación de desarrollo SIN ERP: devuelve movimientos de muestra.</summary>
public sealed class ConsultaDocumentosErpStub : IConsultaDocumentosErp
{
    public Task<IReadOnlyList<MovimientoErp>> MisComprasAsync(
        int idAnexo, DateTime desde, DateTime hasta, CancellationToken ct = default)
    {
        var hoy = DateTime.Today;
        IReadOnlyList<MovimientoErp> muestra =
        [
            new() { IdDocumento = 1, TipoDoc = "BOLETA", FechaEmision = hoy.AddDays(-3),
                    NroSerieDoc = "B001-000123", NomFormaVenta = "CONTADO", NomEstado = "PAGADO",
                    Total = 84.50m, Pagado = 84.50m, Saldo = 0m, Referencia = "OV-5567" },
            new() { IdDocumento = 2, TipoDoc = "FACTURA", FechaEmision = hoy.AddDays(-12),
                    NroSerieDoc = "F001-000045", NomFormaVenta = "CREDITO", NomEstado = "PENDIENTE",
                    Total = 1299.00m, Pagado = 300.00m, Saldo = 999.00m, Referencia = "OV-5540" },
            new() { IdDocumento = 3, TipoDoc = "N/C", FechaEmision = hoy.AddDays(-20), EsInverso = true,
                    NroSerieDoc = "NC01-000009", NomFormaVenta = "CONTADO", NomEstado = "APLICADO",
                    Total = -25.00m, Pagado = -25.00m, Saldo = 0m, Referencia = "F001-000045" },
        ];
        return Task.FromResult(muestra);
    }
}
