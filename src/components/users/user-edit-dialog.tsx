"use client"

import { useRolesQuery } from "@/hooks/use-roles";
import { useUsersMutation } from "@/hooks/use-users";
import { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PaginatedCheckboxList, PaginatedItem } from "../ui/paginated-checkbox-list";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { UserUpdateSchema, UserUpdateSchemaType } from "@/lib/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { PasswordInput } from "../ui/passwrod-input";

interface UserEditDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const limit = 10

  const { update } = useUsersMutation()
  const { findAll } = useRolesQuery({ page, limit, search })

  const form = useForm<UserUpdateSchemaType>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      address: user.address,
      phone: user.phone,
      isActive: user.isActive,
      roleIds: user.roles.map(r => r.id)
    }
  })

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        address: user.address,
        phone: user.phone,
        isActive: user.isActive,
        roleIds: user.roles.map(r => r.id)
      })
    }
  }, [open, user, form])

  async function onSubmit(values: UserUpdateSchemaType) {
    toast.promise(update.mutateAsync({ id: user.id, values }), {
      loading: 'Actualizando Usuario...',
      success: (data) => {
        onOpenChange(false)
        return `Usuario "${data.name}" actualizado exitosamente`
      },
      error: (error) => error.message
    });
  }

  const totalPages: number = findAll.data?.meta.totalPages ?? 1

  const roles = useMemo<PaginatedItem[]>(() => {
    return findAll.data?.data.map(r => ({
      id: r.id,
      label: r.name,
    })) ?? []
  }, [findAll.data])

  return (
    < Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto lg:overflow-visible">
        <DialogHeader className="space-y-1">
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario y guarde los cambios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Juan Pérez"
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="correo@empresa.com"
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Teléfono
                        <span className="text-muted-foreground font-normal text-sm">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+591 70000000"
                          disabled={update.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dirección
                      <span className="text-muted-foreground font-normal text-sm">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Dirección completa"
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Roles asignados
              </h3>

              <div className="rounded-md border bg-muted/30 p-3">
                <FormField
                  control={form.control}
                  name="roleIds"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <PaginatedCheckboxList
                        items={roles}
                        selectedIds={field.value || []}
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
                          const currentValue = field.value || [];
                          field.onChange(
                            checked
                              ? [...currentValue, id]
                              : currentValue.filter((v) => v !== id),
                          )
                        }}
                        hasError={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={update.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Usuario activo</FormLabel>
                    <FormDescription>
                      El usuario podrá iniciar sesión en el sistema.
                    </FormDescription>
                  </div>
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
    </Dialog >
  )
}