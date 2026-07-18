"use client";

import VistaMovimientos from "@/app/components/portal/VistaMovimientos";
import { obtenerMisCompras } from "@/lib/portal-api";

export default function MisComprasPage() {
  return (
    <VistaMovimientos
      titulo="Mis compras"
      ruta="/portal/mis-compras"
      rolesOk={["Cliente", "Proveedor", "Trabajador"]}
      fetcher={obtenerMisCompras}
    />
  );
}
