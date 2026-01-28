"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  type Column,
  type Header,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Search } from "lucide-react"
import { DataTablePagination } from "./data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pagination: PaginationState) => void
  onSearchChange?: (value: string) => void
  searchValue?: string
  searchPlaceholder?: string
  totalItems?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageCount = 0,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
  onSearchChange,
  searchValue = "",
  searchPlaceholder = "Buscar...",
  totalItems = 0,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [localSearch, setLocalSearch] = React.useState(searchValue)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange?.(localSearch)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localSearch, searchValue, onSearchChange])

  React.useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    onPaginationChange: (updater) => {
      const currentPagination: PaginationState = { pageIndex, pageSize }
      const newPagination = typeof updater === "function" ? updater(currentPagination) : updater
      onPaginationChange?.(newPagination)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  })

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
  }

  const getHeaderText = (column: Column<TData, unknown>): string => {
    const header = column.columnDef.header
    
    if (typeof header === "string") {
      return header
    }
    
    if (typeof header === "function") {
      try {
        const mockHeader: Header<TData, unknown> = {
          ...({} as Header<TData, unknown>),
          column,
        }
        const headerElement = header({ 
          column, 
          header: mockHeader,
          table
        })
        
        if (headerElement && typeof headerElement === "object" && "props" in headerElement) {
          const props = (headerElement as React.ReactElement<{ children?: React.ReactNode }>).props
          if (props?.children) {
            const children = props.children
            if (Array.isArray(children)) {
              const textChild = children.find((child: unknown) => typeof child === "string")
              return textChild || column.id
            }
            if (typeof children === "string") {
              return children
            }
          }
        }
      } catch (error) {
        console.warn("Error rendering header:", error)
      }
    }
    
    return column.id
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:ml-auto sm:w-auto bg-transparent">
                Columnas
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {getHeaderText(column)}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Cargando...</span>
                </div>
              </CardContent>
            </Card>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Card
                key={row.id}
                className="overflow-hidden shadow-sm border border-muted/40 rounded-2xl py-0"
              >
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === "imageUrl") {
                    return (
                      <div key={cell.id} className="relative w-full aspect-4/3 bg-muted/10">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    )
                  }
                  return null
                })}

                <CardContent className="px-4 sm:px-5 space-y-3">
                  {row.getVisibleCells().map((cell) => {
                    const headerText = getHeaderText(cell.column)
                    const isImageColumn = cell.column.id === "imageUrl"
                    const isActionsColumn = cell.column.id === "actions"
                    if (isImageColumn) return null

                    if (isActionsColumn) {
                      return (
                        <div
                          key={cell.id}
                          className="flex justify-center pt-3 border-t border-muted/30"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      )
                    }

                    return (
                      <div
                        key={cell.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="font-medium text-muted-foreground">
                          {headerText}:
                        </span>
                        <div className="text-right wrap-break-word max-w-[60%]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchValue
                  ? "No se encontraron resultados para tu búsqueda."
                  : "No hay datos disponibles."}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Cargando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {searchValue ? "No se encontraron resultados para tu búsqueda." : "No hay datos disponibles."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DataTablePagination table={table} totalItems={totalItems} />
    </div>
  )
}