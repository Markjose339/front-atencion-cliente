"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { useIsMobile } from "@/hooks/use-mobile"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalItems?: number
}

export function DataTablePagination<TData>({ table, totalItems = 0 }: DataTablePaginationProps<TData>) {
  const isMobile = useIsMobile()
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = isMobile ? 3 : 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= (isMobile ? 2 : 4); i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - (isMobile ? 1 : 3); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        if (!isMobile) pages.push("...")
        for (let i = currentPage - (isMobile ? 0 : 1); i <= currentPage + (isMobile ? 0 : 1); i++) {
          pages.push(i)
        }
        if (!isMobile) pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const canGoToPrevious = table.getCanPreviousPage()
  const canGoToNext = table.getCanNextPage()

  return (
    <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground text-sm text-center sm:flex-1 sm:text-left">
        Mostrando {table.getFilteredRowModel().rows.length} de {totalItems} registros
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 25, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination className="w-auto mx-0">
          <PaginationContent className="gap-1">
            {!isMobile && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (canGoToPrevious) {
                      table.setPageIndex(0)
                    }
                  }}
                  className="h-8 w-8 p-0"
                  aria-label="Ir a la primera página"
                  size="icon"
                  aria-disabled={!canGoToPrevious}
                  tabIndex={!canGoToPrevious ? -1 : undefined}
                  style={{
                    pointerEvents: !canGoToPrevious ? "none" : "auto",
                    opacity: !canGoToPrevious ? 0.5 : 1,
                  }}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (canGoToPrevious) {
                    table.previousPage()
                  }
                }}
                className="h-8 w-8 p-0"
                aria-label="Ir a la página anterior"
                size="icon"
                aria-disabled={!canGoToPrevious}
                tabIndex={!canGoToPrevious ? -1 : undefined}
                style={{
                  pointerEvents: !canGoToPrevious ? "none" : "auto",
                  opacity: !canGoToPrevious ? 0.5 : 1,
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(Number(page) - 1)
                    }}
                    isActive={currentPage === page}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (canGoToNext) {
                    table.nextPage()
                  }
                }}
                className="h-8 w-8 p-0"
                aria-label="Ir a la página siguiente"
                size="icon"
                aria-disabled={!canGoToNext}
                tabIndex={!canGoToNext ? -1 : undefined}
                style={{
                  pointerEvents: !canGoToNext ? "none" : "auto",
                  opacity: !canGoToNext ? 0.5 : 1,
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
            {!isMobile && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (canGoToNext) {
                      table.setPageIndex(table.getPageCount() - 1)
                    }
                  }}
                  className="h-8 w-8 p-0"
                  aria-label="Ir a la última página"
                  size="icon"
                  aria-disabled={!canGoToNext}
                  tabIndex={!canGoToNext ? -1 : undefined}
                  style={{
                    pointerEvents: !canGoToNext ? "none" : "auto",
                    opacity: !canGoToNext ? 0.5 : 1,
                  }}
                >
                  <ChevronsRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}