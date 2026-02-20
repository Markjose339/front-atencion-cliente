"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export interface PaginatedItem {
  id: string
  label: string
}

interface PaginatedCommandSelectProps {
  items: PaginatedItem[]
  value?: string
  placeholder?: string
  search: string
  page: number
  totalPages: number
  isLoading?: boolean
  disabled?: boolean
  onChange: (value: string) => void
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
}

export function PaginatedCommandSelect({
  items,
  value,
  placeholder,
  search,
  page,
  totalPages,
  isLoading = false,
  disabled = false,
  onChange,
  onSearchChange,
  onPageChange,
}: PaginatedCommandSelectProps) {
  const selected = items.find((i) => i.id === value)

  const [localSearch, setLocalSearch] = useState(search)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [localSearch, search, onSearchChange])

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  useEffect(() => {
    onPageChange(1)
  }, [search, onPageChange])

  const canGoToPrevious = page > 1
  const canGoToNext = page < totalPages

  // Igual lógica que tu DataTablePagination (pero sin hook mobile)
  const getPageNumbers = (currentPage: number, total: number) => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) pages.push(i)
      return pages
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push("...")
      pages.push(total)
      return pages
    }

    if (currentPage >= total - 2) {
      pages.push(1)
      pages.push("...")
      for (let i = total - 3; i <= total; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    pages.push("...")
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
    pages.push("...")
    pages.push(total)
    return pages
  }

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={`w-full justify-between font-normal ${
            !selected ? "text-muted-foreground" : ""
          }`}
        >
          {selected?.label ?? placeholder ?? "Seleccionar"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar..."
            value={localSearch}
            onValueChange={setLocalSearch}
          />

          <CommandEmpty>
            {isLoading ? "Cargando..." : "Sin resultados"}
          </CommandEmpty>

          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => {
                  onChange(item.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === item.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {totalPages > 1 && (
            <div className="border-t p-2">
              <Pagination className="w-auto mx-0">
                <PaginationContent className="gap-1">
                  {/* Primera */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (canGoToPrevious) onPageChange(1)
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

                  {/* Anterior */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (canGoToPrevious) onPageChange(page - 1)
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

                  {/* Números */}
                  {pageNumbers.map((p, idx) => (
                    <PaginationItem key={idx}>
                      {p === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onPageChange(Number(p))
                          }}
                          isActive={page === p}
                          className="h-8 w-8 p-0"
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {/* Siguiente */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (canGoToNext) onPageChange(page + 1)
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

                  {/* Última */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (canGoToNext) onPageChange(totalPages)
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
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
