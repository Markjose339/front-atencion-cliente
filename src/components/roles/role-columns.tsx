import type { ColumnDef, Column } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import type { Role } from "@/types/role"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleActions } from "./role-actions"

const SORT_BTN_CLASS = "h-8 px-2 -ml-2"

const BADGE_FIRST =
  "text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors duration-200"

const BADGE_MORE =
  "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-help transition-colors duration-200"

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>
  title: string
}

function SortableHeader<TData>({ column, title }: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      className={SORT_BTN_CLASS}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

function formatDateLaPaz(value: unknown): string {
  if (!value) return "—"

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(date)
}

export const roleColumns = (): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => <SortableHeader column={column} title="Permisos" />,
    cell: ({ getValue }) => {
      const permissions = (getValue() as Role["permissions"]) ?? []

      if (permissions.length === 0) {
        return <span className="text-muted-foreground text-xs">Sin permisos</span>
      }

      const [first, ...rest] = permissions

      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={BADGE_FIRST}>
            {first?.name ?? "—"}
          </Badge>

          {rest.length > 0 && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={BADGE_MORE}>
                  +{rest.length}
                </Badge>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                align="start"
                className="p-2.5 shadow-lg border min-w-44 max-h-60 overflow-y-auto
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
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
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                        <span className="text-xs">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha de creación" />
    ),
    cell: ({ getValue }) => formatDateLaPaz(getValue()),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <RoleActions role={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
]
