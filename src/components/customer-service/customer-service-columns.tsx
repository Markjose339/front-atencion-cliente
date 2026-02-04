"use client"

import { ColumnDef } from "@tanstack/react-table";
import { CustomerService } from "@/types/customer-service";
import { CustomerServiceActions } from "./customer-service-actions";

export const customerServiceColumns = (): ColumnDef<CustomerService>[] => [
  {
    accessorKey: "code",
    header: "Ticket"
  },
  {
    accessorKey: "packageCode",
    header: "Codigo de Paquete"
  },
  {
    accessorKey: "type",
    header: "Tipo"
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de creación",
    cell: ({ getValue }) => {
      const dateString = getValue() as string;
      const date = new Date(dateString);
      const adjustedDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));

      return adjustedDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const customerService = row.original;
      return <CustomerServiceActions customerService={customerService} />;
    },
  },
];