import { Role } from "@/types/role";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { RoleActions } from "./role-actions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const roleColumns = (): ColumnDef<Role>[] => [
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
    accessorKey: "permissions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Permisos
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const permissions = getValue() as Role["permissions"];
      const [first, ...rest] = permissions;

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 rounded-full
          bg-blue-50 dark:bg-blue-950/20
          border-blue-200 dark:border-blue-800
          text-blue-700 dark:text-blue-400
          hover:bg-blue-100 dark:hover:bg-blue-950/30
          transition-colors duration-200"
          >
            {first.name}
          </Badge>

          {rest.length > 0 && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 rounded-full
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-700
                text-gray-600 dark:text-gray-400
                hover:bg-gray-200 dark:hover:bg-gray-700
                cursor-help transition-colors duration-200"
                >
                  +{rest.length}
                </Badge>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                align="start"
                className="p-2.5 shadow-lg border min-w-40
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-2">
                  <div className="font-medium text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider">
                    Permisos adicionales
                  </div>

                  <div className="space-y-1">
                    {rest.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-1.5 py-1 px-1.5 rounded-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150"
                      >
                        <div className="w-1.5 h-1.5 rounded-full
                      bg-blue-500 dark:bg-blue-400 shrink-0"
                        />
                        <span className="text-xs">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    }
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
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
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
    cell: ({ row }) => <RoleActions role={row.original} />,
  },
];
