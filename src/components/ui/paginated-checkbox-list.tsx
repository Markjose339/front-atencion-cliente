"use client"

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface PaginatedItem {
  id: string
  label: string
}

interface PaginatedCheckboxListProps<T extends PaginatedItem> {
  items: T[]
  selectedIds: string[]
  page: number
  totalPages: number
  search: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onToggle: (id: string, checked: boolean) => void
  hasError?: boolean
}

export function PaginatedCheckboxList<T extends PaginatedItem>({
  items,
  selectedIds,
  page,
  totalPages,
  search,
  isLoading,
  onSearchChange,
  onPageChange,
  onToggle,
  hasError = false,
}: PaginatedCheckboxListProps<T>) {
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [localSearch, search, onSearchChange])

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages)
    } else if (page >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages)
    }

    return pages
  }

  const canGoToPrevious = page > 1
  const canGoToNext = page < totalPages

  return (
    <div
      className={`rounded-md border p-3 space-y-3 ${
        hasError ? "border-destructive" : "border-input"
      }`}
    >
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Cargando resultados…
          </p>
        )}

        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No se encontraron resultados
          </p>
        )}

        {!isLoading &&
          items.map((item) => {
            const checked = selectedIds.includes(item.id)
            return (
              <Label
                key={item.id}
                className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 
                  has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50
                  dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950"
              >
                <Checkbox
                  id={item.id}
                  checked={checked}
                  onCheckedChange={(value) => onToggle(item.id, value === true)}
                  className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                />
                <div className="grid gap-1.5 font-normal">
                  <p className="text-sm leading-none font-medium">{item.label}</p>
                </div>
              </Label>
            )
          })}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault()
                  if (canGoToPrevious) onPageChange(page - 1)
                }}
                className={!canGoToPrevious ? "pointer-events-none opacity-50" : ""}
                aria-disabled={!canGoToPrevious}
                tabIndex={!canGoToPrevious ? -1 : undefined}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>

            {getPageNumbers().map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={page === pageNum}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(Number(pageNum))
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault()
                  if (canGoToNext) onPageChange(page + 1)
                }}
                className={!canGoToNext ? "pointer-events-none opacity-50" : ""}
                aria-disabled={!canGoToNext}
                tabIndex={!canGoToNext ? -1 : undefined}
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
