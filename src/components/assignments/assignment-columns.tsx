"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Assignment } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import { AssignmentActions } from "@/components/assignments/assignment-actions";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

function SortableHeader<TData>({ column, title }: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const assignmentColumns = (): ColumnDef<Assignment>[] => [
  {
    id: "branch",
    accessorFn: (row) => row.branch?.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Sucursal" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.branch?.name }</span>
    ),
  },
  {
    id: "window",
    accessorFn: (row) => row.window?.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Ventanilla" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.window?.name }
      </span>
    ),
  },
  {
    id: "service",
    accessorFn: (row) => row.service?.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Servicio" />
    ),
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="font-medium">{row.original.service?.name }</div>
        <div className="text-xs text-muted-foreground">
          {row.original.service?.abbreviation}
        </div>
      </div>
    ),
  },
  {
    id: "user",
    accessorFn: (row) => row.user?.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="font-medium">{row.original.user?.name }</div>
        <div className="text-xs text-muted-foreground">
          {row.original.user?.email }
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <AssignmentActions assignment={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
