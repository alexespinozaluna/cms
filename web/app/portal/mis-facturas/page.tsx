"use client";

import VistaMovimientos from "@/app/components/portal/VistaMovimientos";
import { obtenerMisFacturas } from "@/lib/portal-api";

export default function MisFacturasPage() {
  return (
    <VistaMovimientos
      titulo="Mis facturas"
      ruta="/portal/mis-facturas"
      rolesOk={["Proveedor"]}
      fetcher={obtenerMisFacturas}
    />
  );
}
