"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

import { useRolesQuery } from "@/hooks/use-roles"
import { useUsersMutation } from "@/hooks/use-users"

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

export function UserCreateDialog() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const limit = 10

  const { create } = useUsersMutation()
  const { findAll } = useRolesQuery({ page, limit, search })

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
    },
  })

  async function onSubmit(values: UserCreateSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando usuario...",
      success: (data) => {
        setOpen(false)
        form.reset()
        return `Usuario "${data.name}" creado exitosamente`
      },
      error: (error: Error) => error.message,
    })
  }

  const totalPages = findAll.data?.meta.totalPages ?? 1

  const roles = useMemo<PaginatedItem[]>(() => {
    return findAll.data?.data.map((role) => ({
      id: role.id,
      label: role.name,
    })) ?? []
  }, [findAll.data])
  
  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      form.reset()
      setPage(1)
      setSearch("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto ">
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
                    Dirección
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
              name="roleIds"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormDescription>Seleccione los roles a asignar</FormDescription>
                  <PaginatedCheckboxList
                    items={roles}
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
                      field.onChange(
                        checked
                          ? [...field.value, id]
                          : field.value.filter((v) => v !== id),
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
                      className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 
                        has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50
                        dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950"
                    >
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={create.isPending}
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white 
                        dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
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
                <Button variant="outline" type="button">
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
