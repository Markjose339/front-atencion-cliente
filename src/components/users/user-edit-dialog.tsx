"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useRolesQuery } from "@/hooks/use-roles"
import { useUsersMutation } from "@/hooks/use-users"
import { useServiceWindowsQuery } from "@/hooks/use-service-windows"

import { User } from "@/types/user"
import { UserUpdateSchema, UserUpdateSchemaType } from "@/lib/schemas/user.schema"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  PaginatedCheckboxList,
  PaginatedItem,
} from "@/components/ui/paginated-checkbox-list"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/passwrod-input"
import { PaginatedCommandSelect } from "@/components/ui/paginated-command-select"

const ITEMS_PER_PAGE = 10

interface UserEditDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const [rolesPage, setRolesPage] = useState(1)
  const [rolesSearch, setRolesSearch] = useState("")

  const [serviceWindowsPage, setServiceWindowsPage] = useState(1)
  const [serviceWindowsSearch, setServiceWindowsSearch] = useState("")

  const { update } = useUsersMutation()

  const { findAll: findAllRoles } = useRolesQuery({
    page: rolesPage,
    limit: ITEMS_PER_PAGE,
    search: rolesSearch,
  })

  const { findAllServiceWindows } = useServiceWindowsQuery({
    page: serviceWindowsPage,
    limit: ITEMS_PER_PAGE,
    search: serviceWindowsSearch,
  })

  const form = useForm<UserUpdateSchemaType>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      password: "",
      address: user.address || "",
      phone: user.phone || "",
      isActive: user.isActive,
      roleIds: user.roles.map((r) => r.id),
      serviceWindowId: user.serviceWindow.id || undefined,
    },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        password: "",
        address: user.address || "",
        phone: user.phone || "",
        isActive: user.isActive,
        roleIds: user.roles.map((r) => r.id),
        serviceWindowId: user.serviceWindow.id || undefined,
      })
    }
  }, [open, user, form])

  async function onSubmit(values: UserUpdateSchemaType) {
    toast.promise(update.mutateAsync({ id: user.id, values }), {
      loading: "Actualizando usuario...",
      success: (data) => {
        handleDialogClose()
        return `Usuario "${data.name}" actualizado exitosamente`
      },
      error: (error: Error) => error.message,
    })
  }

  const roles = useMemo<PaginatedItem[]>(() => {
    return (
      findAllRoles.data?.data.map((role) => ({
        id: role.id,
        label: role.name,
      })) ?? []
    )
  }, [findAllRoles.data])

  const serviceWindows = useMemo<PaginatedItem[]>(() => {
    return (
      findAllServiceWindows.data?.data.map((window) => ({
        id: window.id,
        label: window.name,
      })) ?? []
    )
  }, [findAllServiceWindows.data])

  const handleRolesSearchChange = (value: string) => {
    setRolesSearch(value)
    setRolesPage(1)
  }

  const handleServiceWindowsSearchChange = (value: string) => {
    setServiceWindowsSearch(value)
    setServiceWindowsPage(1)
  }

  const handleDialogClose = () => {
    onOpenChange(false)
    setRolesPage(1)
    setRolesSearch("")
    setServiceWindowsPage(1)
    setServiceWindowsSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        handleDialogClose()
      } else {
        onOpenChange(value)
      }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario y guarde los cambios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Información personal
              </h3>

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
                      <FormLabel>
                        Nueva contraseña{" "}
                        <span className="text-muted-foreground font-normal text-sm">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Dejar vacío para mantener actual"
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
                        Teléfono{" "}
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
                      Dirección{" "}
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

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Asignación
              </h3>

              <FormField
                control={form.control}
                name="serviceWindowId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ventanilla de servicio</FormLabel>
                    <FormControl>
                      <PaginatedCommandSelect
                        items={serviceWindows}
                        value={field.value}
                        search={serviceWindowsSearch}
                        page={serviceWindowsPage}
                        totalPages={findAllServiceWindows.data?.meta.totalPages ?? 1}
                        isLoading={findAllServiceWindows.isLoading}
                        onChange={field.onChange}
                        onSearchChange={handleServiceWindowsSearchChange}
                        onPageChange={setServiceWindowsPage}
                        placeholder="Seleccione una ventanilla..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleIds"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormDescription>
                      Seleccione los roles asignados al usuario
                    </FormDescription>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <PaginatedCheckboxList
                        items={roles}
                        selectedIds={field.value || []}
                        page={rolesPage}
                        totalPages={findAllRoles.data?.meta.totalPages ?? 1}
                        search={rolesSearch}
                        isLoading={findAllRoles.isLoading}
                        onSearchChange={handleRolesSearchChange}
                        onPageChange={setRolesPage}
                        onToggle={(id, checked) => {
                          const currentValue = field.value || []
                          field.onChange(
                            checked
                              ? [...currentValue, id]
                              : currentValue.filter((v) => v !== id)
                          )
                        }}
                        hasError={!!fieldState.error}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label
                      className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                        has-checked:border-primary has-checked:bg-primary/5"
                    >
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={update.isPending}
                      />

                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Usuario activo
                        </p>
                        <p className="text-muted-foreground text-sm">
                          El usuario podrá iniciar sesión en el sistema.
                        </p>
                      </div>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={update.isPending}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}