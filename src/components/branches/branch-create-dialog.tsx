"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useBranchesMutation } from "@/hooks/use-branches";
import { PaginatedCommandSelect } from "@/components/ui/paginated-command-select";
import { PaginatedItem } from "@/components/ui/paginated-checkbox-list";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { BranchSchema, BranchSchemaType } from "@/lib/schemas/branch.schema";

export function BranchCreateDialog() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")

  const limit = 10

  const { create } = useBranchesMutation();
  const { findAllDepartments } = useDepartmentsQuery({ page, limit, search })

  const form = useForm<BranchSchemaType>({
    resolver: zodResolver(BranchSchema),
    defaultValues: {
      name: "",
      address: "",
      departmentId: ""
    },
  });

  async function onSubmit(values: BranchSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando sucursal...",
      success: (data) => {
        setOpen(false);
        form.reset();
        return `Sucursal "${data.name}" creada exitosamente`;
      },
      error: (error) => error.message,
    });
  }

  const departments = useMemo<PaginatedItem[]>(() => {
    return findAllDepartments.data?.data.map((role) => ({
      id: role.id,
      label: role.name,
    })) ?? []
  }, [findAllDepartments.data])

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) form.reset();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Sucursal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Crear Nueva Sucursal</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva sucursal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la sucursal" {...field} disabled={create.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dirección
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
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={departments}
                      value={field.value}
                      search={search}
                      page={page}
                      totalPages={findAllDepartments.data?.meta.totalPages ?? 1}
                      isLoading={findAllDepartments.isLoading}
                      onChange={field.onChange}
                      onSearchChange={handleSearchChange}
                      onPageChange={setPage}
                      placeholder="Seleccione una departamento..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={create.isPending}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
