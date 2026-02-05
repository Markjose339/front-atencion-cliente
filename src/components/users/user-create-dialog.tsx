"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

import { useRolesQuery } from "@/hooks/use-roles"
import { useUsersMutation } from "@/hooks/use-users"
import { useServiceWindowsQuery } from "@/hooks/use-service-windows"

import { UserCreateSchemaType, UserSchema } from "@/lib/schemas/user.schema"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

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
import { Label } from "../ui/label"
import { PasswordInput } from "../ui/passwrod-input"
import { PaginatedCommandSelect } from "../ui/paginated-command-select"

const ITEMS_PER_PAGE = 10

export function UserCreateDialog() {
  const [open, setOpen] = useState(false)

  const [rolesPage, setRolesPage] = useState(1)
  const [rolesSearch, setRolesSearch] = useState("")

  const [serviceWindowsPage, setServiceWindowsPage] = useState(1)
  const [serviceWindowsSearch, setServiceWindowsSearch] = useState("")

  const { create } = useUsersMutation()
  
  const { findAll: findAllRoles } = useRolesQuery({ 
    page: rolesPage, 
    limit: ITEMS_PER_PAGE, 
    search: rolesSearch 
  })

  const { findAllServiceWindows } = useServiceWindowsQuery({ 
    page: serviceWindowsPage, 
    limit: ITEMS_PER_PAGE, 
    search: serviceWindowsSearch 
  })

  const form = useForm<UserCreateSchemaType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      isActive: true,
      roleIds: [],
      serviceWindowId: undefined,
    },
  })

  async function onSubmit(values: UserCreateSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando usuario...",
      success: (data) => {
        handleOpenChange(false)
        return `Usuario "${data.name}" creado exitosamente`
      },
      error: (error: Error) => error.message,
    })
  }

  const roles = useMemo<PaginatedItem[]>(() => {
    return findAllRoles.data?.data.map((role) => ({
      id: role.id,
      label: role.name,
    })) ?? []
  }, [findAllRoles.data])

  const serviceWindows = useMemo<PaginatedItem[]>(() => {
    return findAllServiceWindows.data?.data.map((window) => ({
      id: window.id,
      label: window.name,
    })) ?? []
  }, [findAllServiceWindows.data])

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      form.reset()
      setRolesPage(1)
      setRolesSearch("")
      setServiceWindowsPage(1)
      setServiceWindowsSearch("")
    }
  }

  const handleRolesSearchChange = (value: string) => {
    setRolesSearch(value)
    setRolesPage(1)
  }

  const handleServiceWindowsSearchChange = (value: string) => {
    setServiceWindowsSearch(value)
    setServiceWindowsPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Registra un nuevo usuario y asigna sus roles de acceso.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      disabled={create.isPending}
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
                      disabled={create.isPending}
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
                        disabled={create.isPending}
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
                        disabled={create.isPending}
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
                      disabled={create.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Seleccione los roles a asignar al usuario
                  </FormDescription>
                  <PaginatedCheckboxList
                    items={roles}
                    selectedIds={field.value}
                    page={rolesPage}
                    totalPages={findAllRoles.data?.meta.totalPages ?? 1}
                    search={rolesSearch}
                    isLoading={findAllRoles.isLoading}
                    onSearchChange={handleRolesSearchChange}
                    onPageChange={setRolesPage}
                    onToggle={(id, checked) => {
                      field.onChange(
                        checked
                          ? [...field.value, id]
                          : field.value.filter((v) => v !== id)
                      )
                    }}
                    hasError={!!fieldState.error}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        disabled={create.isPending}
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
                <Button variant="outline" type="button" disabled={create.isPending}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}