"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RoleSchema } from "@/lib/schemas/role.schema"
import { useRolesMutation } from "@/hooks/use-roles"
import { usePermissionsQuery } from "@/hooks/use-permissions"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { PaginatedCheckboxList, PaginatedItem } from "@/components/ui/paginated-checkbox-list"

type RoleFormValues = z.infer<typeof RoleSchema>

export function RoleCreateDialog() {
  const [open, setOpen] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")

  const limit = 10

  const { create } = useRolesMutation()
  const { findAll } = usePermissionsQuery({ page, limit, search })

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: "",
      permissionIds: [],
    },
  })

  async function onSubmit(values: RoleFormValues) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando Rol...",
      success: (data) => {
        setOpen(false)
        form.reset()
        return `Rol "${data.name}" creado exitosamente`
      },
      error: (error: Error) => error.message,
    })
  }

  const totalPages: number = findAll.data?.meta.totalPages ?? 1

  const permissions = useMemo<PaginatedItem[]>(() => {
    return findAll.data?.data.map((p) => ({
      id: p.id,
      label: p.name,
    })) ?? []
  }, [findAll.data])

  const handleOnOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      form.reset()
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={handleOnOpenChange}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Rol</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo rol
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Rol</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={create.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionIds"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Permisos</FormLabel>
                  <FormDescription>Seleccione los permisos a asignar</FormDescription>
                  <PaginatedCheckboxList
                    items={permissions}
                    selectedIds={field.value}
                    page={page}
                    totalPages={totalPages}
                    search={search}
                    isLoading={findAll.isLoading}
                    onSearchChange={(value) => {
                      setSearch(value)
                      setPage(1)
                    }}
                    onPageChange={setPage}
                    onToggle={(id, checked) => {
                      if (checked) {
                        field.onChange([...field.value, id])
                      } else {
                        field.onChange(field.value.filter((v) => v !== id))
                      }
                    }}
                    hasError={!!fieldState.error}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Rol"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
