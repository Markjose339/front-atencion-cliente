"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { OperatorAssignment } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { OperatorAssignmentActions } from "./operator-assignment-actions";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

function SortableHeader<TData>({ column, title }: SortableHeaderProps<TData>) {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const operatorAssignmentColumns = (): ColumnDef<OperatorAssignment>[] => [
  {
    id: "user",
    accessorFn: (row) => row.user.name,
    header: ({ column }) => <SortableHeader column={column} title="Operador" />,
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="font-medium">{row.original.user.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    id: "branch",
    accessorFn: (row) => row.branch.name,
    header: ({ column }) => <SortableHeader column={column} title="Sucursal" />,
    cell: ({ row }) => <span className="font-medium">{row.original.branch.name}</span>,
  },
  {
    id: "window",
    accessorFn: (row) => row.window.name,
    header: ({ column }) => <SortableHeader column={column} title="Ventanilla" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.window.name} ({row.original.window.code})
      </div>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => row.isActive,
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <OperatorAssignmentActions assignment={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
