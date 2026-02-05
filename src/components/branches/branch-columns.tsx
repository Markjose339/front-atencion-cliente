"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Branch } from "@/types/branch";
import { BranchActions } from "@/components/branches/branch-actions";

export const branchColumns = (): ColumnDef<Branch>[] => [
  // =========================
  // Nombre
  // =========================
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  // =========================
  // Dirección
  // =========================
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.address}
      </span>
    ),
  },

  // =========================
  // Departamento (relación)
  // =========================
  {
    id: "department",
    header: "Departamento",
    cell: ({ row }) => {
      const dept = row.original.department;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{dept.name}</span>
          <span className="text-xs text-muted-foreground">{dept.code}</span>
        </div>
      );
    },
  },

  // =========================
  // Fecha de creación
  // =========================
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha de creación
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const dateString = getValue() as string;
      const date = new Date(dateString);

      // Ajuste Bolivia (-4 UTC)
      const adjustedDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);

      return adjustedDate.toLocaleDateString("es-BO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },

  // =========================
  // Acciones
  // =========================
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <BranchActions branch={row.original} />,
  },
];
