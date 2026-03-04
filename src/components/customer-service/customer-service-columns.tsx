"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { CustomerServiceTicket, CustomerServiceTicketType } from "@/types/customer-service";

import { CustomerServiceStatusBadge } from "./customer-service-status-badge";
import { formatCustomerServiceDate } from "./customer-service-utils";

const TICKET_TYPE_LABELS: Record<CustomerServiceTicketType, string> = {
  REGULAR: "Regular",
  PREFERENCIAL: "Preferencial",
};

const TICKET_TYPE_VARIANTS: Record<
  CustomerServiceTicketType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  REGULAR: "outline",
  PREFERENCIAL: "secondary",
};

export const customerServiceColumns = (): ColumnDef<CustomerServiceTicket>[] => [
  {
    accessorKey: "code",
    header: "Ticket",
  },
  {
    accessorKey: "packageCode",
    header: "Codigo de Paquete",
    cell: ({ row }) => row.original.packageCode || "-",
  },
  {
    accessorKey: "packageZone",
    header: "Zona de Paquete",
    cell: ({ row }) => row.original.packageZone || "-",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant={TICKET_TYPE_VARIANTS[row.original.type]}>
        {TICKET_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <CustomerServiceStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => formatCustomerServiceDate(row.original.createdAt),
  },
  {
    accessorKey: "calledAt",
    header: "Llamado",
    cell: ({ row }) => formatCustomerServiceDate(row.original.calledAt),
  },
  {
    accessorKey: "attentionStartedAt",
    header: "Inicio atencion",
    cell: ({ row }) => formatCustomerServiceDate(row.original.attentionStartedAt),
  },
];
