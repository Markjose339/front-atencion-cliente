import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { UserActions } from "./user-actions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const userColumns = (): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo Electrónico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dirección
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const address = getValue() as string;
      return <span className="text-sm">{address || "No especificada"}</span>;
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Teléfono
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const phone = getValue() as string;
      return <span className="text-sm">{phone || "No especificado"}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;

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
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
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
              <XCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" aria-hidden="true" />
              <span className="text-xs font-medium tracking-tight">Inactivo</span>
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Roles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const roles = getValue() as User["roles"];
      const [first, ...rest] = roles;

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
                side="top"
                align="start"
                className="p-2.5 shadow-lg border min-w-40
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-2">
                  <div className="font-medium text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider">
                    Roles adicionales
                  </div>

                  <div className="space-y-1">
                    {rest.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center gap-1.5 py-1 px-1.5 rounded-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150"
                      >
                        <div className="w-1.5 h-1.5 rounded-full
                      bg-blue-500 dark:bg-blue-400 shrink-0"
                        />
                        <span className="text-xs">{role.name}</span>
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UserActions user={user} />
      );
    },
  },
];