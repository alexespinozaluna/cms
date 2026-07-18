/**
 * Opciones del portal por rol. Cada opción la ven uno o más roles del ERP; el
 * usuario ve la UNIÓN de las opciones de sus roles. `disponible:false` se muestra
 * como "Próximamente" hasta que exista el SP/endpoint que alimente la vista.
 */
export interface OpcionPortal {
  clave: string; // slug para la futura ruta (/portal/<clave>)
  titulo: string;
  descripcion: string;
  roles: string[]; // roles que pueden verla
  href?: string; // definido cuando la vista exista
  disponible: boolean;
}

export const opcionesPortal: OpcionPortal[] = [
  {
    clave: "estado-cuenta",
    titulo: "Estado de cuenta",
    descripcion: "Tus movimientos y saldo en el bazar.",
    roles: ["Cliente"],
    disponible: false,
  },
  {
    clave: "mis-compras",
    titulo: "Mis compras",
    descripcion: "Historial de tus compras y comprobantes.",
    roles: ["Cliente", "Proveedor", "Trabajador"],
    disponible: false,
  },
  {
    clave: "mis-facturas",
    titulo: "Mis facturas",
    descripcion: "Estado de tus facturas presentadas.",
    roles: ["Proveedor"],
    disponible: false,
  },
  {
    clave: "boleta-pago",
    titulo: "Boleta de pago",
    descripcion: "Tus boletas y descuentos de planilla.",
    roles: ["Trabajador"],
    disponible: false,
  },
  {
    clave: "liquidacion-pagos",
    titulo: "Liquidación de pagos",
    descripcion: "Detalle y calendario de tus pagos.",
    roles: ["Concesionario"],
    disponible: false,
  },
];

/** Opciones visibles para un conjunto de roles (unión, sin duplicar). */
export function opcionesParaRoles(roles: string[]): OpcionPortal[] {
  return opcionesPortal.filter((o) => o.roles.some((r) => roles.includes(r)));
}
