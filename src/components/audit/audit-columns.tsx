"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  formatAuditDateTime,
  formatAuditUserLabel,
  humanizeAuditToken,
} from "@/hooks/use-audit";
import { AuditLogItem } from "@/types/audit";

const formatearNavegador = (userAgent?: string | null) => {
  if (!userAgent?.trim()) return "Sin información";

  if (userAgent.includes("Edg")) return "Microsoft Edge";
  if (userAgent.includes("Chrome")) return "Google Chrome";
  if (userAgent.includes("Firefox")) return "Mozilla Firefox";
  if (userAgent.includes("Safari")) return "Safari";

  return "Navegador desconocido";
};

export const auditColumns = (): ColumnDef<AuditLogItem>[] => [
  {
    accessorKey: "createdAt",
    header: "Fecha / Hora",
    cell: ({ row }) => formatAuditDateTime(row.original.createdAt),
  },
  {
    id: "user",
    header: "Usuario",
    cell: ({ row }) => {
      const usuario = row.original.user;
      const nombre = formatAuditUserLabel(usuario);
      const correo = usuario?.email?.trim();

      return (
        <div className="space-y-0.5">
          <p className="font-medium leading-tight">{nombre}</p>
          {correo && correo !== nombre && (
            <p className="text-xs text-muted-foreground">{correo}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Acción",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {humanizeAuditToken(row.original.action)}
      </Badge>
    ),
  },
  {
    accessorKey: "auditableType",
    header: "Entidad",
    cell: ({ row }) =>
      humanizeAuditToken(row.original.auditableType),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.original.description?.trim();

      return descripcion ? (
        <p className="max-w-[40ch] truncate">{descripcion}</p>
      ) : (
        <span className="text-muted-foreground">
          Sin descripción
        </span>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: "Dirección IP",
    cell: ({ row }) =>
      row.original.ipAddress?.trim() || "No registrada",
  },
  {
    accessorKey: "userAgent",
    header: "Navegador",
    cell: ({ row }) =>
      formatearNavegador(row.original.userAgent),
  },
];