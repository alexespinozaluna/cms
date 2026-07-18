"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Movimiento } from "@/lib/portal-api";
import { formatearPrecio, formatearFecha } from "@/lib/formato";

/** Tabla transaccional reutilizable para las vistas del portal (TanStack Table). */
export default function TablaMovimientos({ datos }: { datos: Movimiento[] }) {
  const columnas = useMemo<ColumnDef<Movimiento>[]>(
    () => [
      { accessorKey: "fechaEmision", header: "Fecha", cell: (c) => formatearFecha(c.getValue<string>()) },
      { accessorKey: "tipoDoc", header: "Tipo" },
      { accessorKey: "nroSerieDoc", header: "Comprobante" },
      { accessorKey: "nomFormaVenta", header: "Forma" },
      { accessorKey: "nomEstado", header: "Estado" },
      { accessorKey: "total", header: "Total", cell: (c) => formatearPrecio(c.getValue<number>()) },
      { accessorKey: "pagado", header: "Pagado", cell: (c) => formatearPrecio(c.getValue<number>()) },
      { accessorKey: "saldo", header: "Saldo", cell: (c) => formatearPrecio(c.getValue<number>()) },
      { accessorKey: "referencia", header: "Referencia" },
    ],
    [],
  );

  const tabla = useReactTable({ data: datos, columns: columnas, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto rounded-[10px] border border-linea bg-white">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-papel">
          {tabla.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="border-b border-linea px-3 py-2 text-left font-semibold text-verde-osc"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tabla.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-papel/60">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b border-linea px-3 py-2 text-texto/80">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {datos.length === 0 && (
        <p className="px-3 py-6 text-center text-sm text-texto/60">
          Sin movimientos en el rango seleccionado.
        </p>
      )}
    </div>
  );
}
