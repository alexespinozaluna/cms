/**
 * Opciones del portal por rol (v1). Los roles vienen del ERP (Anexo) y se
 * combinan. `disponible:false` = se muestra como "Próximamente" hasta que
 * exista el SP del ERP que alimente la vista. Ajustar libremente esta config.
 */
export interface OpcionPortal {
  titulo: string;
  descripcion: string;
  href?: string;
  disponible: boolean;
}

export interface SeccionRol {
  etiqueta: string;
  opciones: OpcionPortal[];
}

export const seccionesPorRol: Record<string, SeccionRol> = {
  Cliente: {
    etiqueta: "Cliente",
    opciones: [
      { titulo: "Estado de cuenta", descripcion: "Tus movimientos y saldo en el bazar.", disponible: false },
      { titulo: "Historial de compras", descripcion: "Tus compras y comprobantes.", disponible: false },
      { titulo: "Cuotas y descuentos", descripcion: "Próximos descuentos por planilla.", disponible: false },
    ],
  },
  Proveedor: {
    etiqueta: "Proveedor",
    opciones: [
      { titulo: "Estado de facturas", descripcion: "Situación de tus facturas presentadas.", disponible: false },
      { titulo: "Calendario de pagos", descripcion: "Detalle y fechas de pago.", disponible: false },
      { titulo: "Constancias y comprobantes", descripcion: "Documentos para descarga.", disponible: false },
    ],
  },
  Concesionario: {
    etiqueta: "Concesionario",
    opciones: [
      { titulo: "Mi concesión", descripcion: "Datos de tu concesión y contrato.", disponible: false },
      { titulo: "Pagos y obligaciones", descripcion: "Estado de pagos y vencimientos.", disponible: false },
    ],
  },
  Trabajador: {
    etiqueta: "Trabajador",
    opciones: [
      { titulo: "Mis boletas", descripcion: "Boletas y descuentos de planilla.", disponible: false },
      { titulo: "Beneficios del personal", descripcion: "Beneficios y campañas para el personal.", disponible: false },
    ],
  },
};

/** Secciones a mostrar para un conjunto de roles, en orden fijo. */
export function seccionesDeRoles(roles: string[]): Array<{ rol: string } & SeccionRol> {
  const orden = ["Cliente", "Proveedor", "Concesionario", "Trabajador"];
  return orden
    .filter((rol) => roles.includes(rol) && seccionesPorRol[rol])
    .map((rol) => ({ rol, ...seccionesPorRol[rol] }));
}
