"use client";

import VistaMovimientos from "@/app/components/portal/VistaMovimientos";
import { obtenerLiquidacionPagos } from "@/lib/portal-api";

export default function LiquidacionPagosPage() {
  return (
    <VistaMovimientos
      titulo="Liquidación de pagos"
      ruta="/portal/liquidacion-pagos"
      rolesOk={["Concesionario"]}
      fetcher={obtenerLiquidacionPagos}
    />
  );
}
