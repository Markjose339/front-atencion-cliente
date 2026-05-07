"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Window } from "@/types/window";
import { WindowActions } from "@/components/windows/window-actions";
import { Badge } from "@/components/ui/badge";

export const windowColumns = (): ColumnDef<Window>[] => [
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
   {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Codigo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "isActive",
   header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const isActive = Boolean(getValue() as boolean | null | undefined)

      return (
        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-emerald-50 dark:bg-transparent
              border-emerald-200 dark:border-emerald-700
              text-emerald-700 dark:text-emerald-400
              transition-all duration-200 hover:scale-[1.02]
              hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
              aria-label="Estado: Activo"
            >
              <CheckCircle
                className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span className="text-xs font-medium tracking-tight">Activo</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-rose-50 dark:bg-transparent
              border-rose-200 dark:border-rose-700
              text-rose-700 dark:text-rose-400
              transition-all duration-200 hover:scale-[1.02]
              hover:bg-rose-100 dark:hover:bg-rose-950/30"
              aria-label="Estado: Inactivo"
            >
              <XCircle
                className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400"
                aria-hidden="true"
              />
              <span className="text-xs font-medium tracking-tight">Inactivo</span>
            </Badge>
          )}
        </div>
      )
    },
  },
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
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <WindowActions window={row.original} />,
  },
];
