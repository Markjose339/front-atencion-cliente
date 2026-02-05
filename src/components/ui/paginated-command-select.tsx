"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
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
  onChange,
  onSearchChange,
  onPageChange,
}: PaginatedCommandSelectProps) {
  const selected = items.find((i) => i.id === value)

  const [localSearch, setLocalSearch] = useState(search)
  const [open, setOpen] = useState(false) // ✅ nuevo

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

  // resetear página cuando cambia búsqueda
  useEffect(() => {
    onPageChange(1)
  }, [search, onPageChange])

  const canGoToPrevious = page > 1
  const canGoToNext = page < totalPages

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
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
                  setOpen(false) // ✅ cerrar al seleccionar
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
            <div className="flex justify-between p-2 border-t">
              <Button
                size="sm"
                variant="ghost"
                disabled={!canGoToPrevious}
                onClick={() => {
                  if (canGoToPrevious) onPageChange(page - 1)
                }}
              >
                Anterior
              </Button>

              <Button
                size="sm"
                variant="ghost"
                disabled={!canGoToNext}
                onClick={() => {
                  if (canGoToNext) onPageChange(page + 1)
                }}
              >
                Siguiente
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
