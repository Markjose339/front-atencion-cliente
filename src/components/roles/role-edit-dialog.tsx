"use client"

import { RoleSchema } from "@/lib/schemas/role.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Role } from "@/types/role";
import { useRolesMutation } from "@/hooks/use-roles";
import { usePermissionsQuery } from "@/hooks/use-permissions";
import { PaginatedCheckboxList, PaginatedItem } from "@/components/ui/paginated-checkbox-list";

interface RoleEditDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleEditDialog({ role, open, onOpenChange }: RoleEditDialogProps) {
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")

  const limit = 10

  const { findAll } = usePermissionsQuery({ page, limit, search })
  const { update } = useRolesMutation()

  const form = useForm<z.infer<typeof RoleSchema>>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: role.name,
      permissionIds: role.permissions.map(p => p.id)
    }
  });
  
  useEffect(() => {
    if (open && role) {
      form.reset({
        name: role.name,
        permissionIds: role.permissions.map(p => p.id)
      })
    }
  }, [open, role, form])

  async function onSubmit(values: z.infer<typeof RoleSchema>) {
    toast.promise(update.mutateAsync({ id: role.id, values }), {
      loading: 'Actualizando Rol...',
      success: (data) => {
        onOpenChange(false)
        return `Rol "${data.name}" actualizado exitosamente`
      },
      error: (error) => error.message
    });
  }

  const totalPages: number = findAll.data?.meta.totalPages ?? 1

  const permissions = useMemo<PaginatedItem[]>(() => {
    return findAll.data?.data.map(p => ({
      id: p.id,
      label: p.name
    })) ?? []
  }, [findAll.data])


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Rol</DialogTitle>
          <DialogDescription>
            {`Modifique los datos del rol "${role.name}".`}
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
                    <Input
                      type="text"
                      placeholder="Nombre del rol (ej: administrador)"
                      {...field}
                      disabled={update.isPending}
                    />
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
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}