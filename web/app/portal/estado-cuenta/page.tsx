"use client";

import VistaMovimientos from "@/app/components/portal/VistaMovimientos";
import { obtenerEstadoCuenta } from "@/lib/portal-api";

export default function EstadoCuentaPage() {
  return (
    <VistaMovimientos
      titulo="Estado de cuenta"
      ruta="/portal/estado-cuenta"
      rolesOk={["Cliente"]}
      fetcher={obtenerEstadoCuenta}
    />
  );
}
