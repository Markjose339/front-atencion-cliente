"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Branch } from "@/types/branch";
import { BranchSchema, BranchSchemaType } from "@/lib/schemas/branch.schema";
import { useBranchesMutation } from "@/hooks/use-branches";
import { PaginatedCommandSelect } from "@/components/ui/paginated-command-select";
import { useDepartmentsQuery } from "@/hooks/use-departments";
import { PaginatedItem } from "../ui/paginated-checkbox-list";

interface BranchEditDialogProps {
  branch: Branch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 10

export default function BranchEditDialog({ branch, open, onOpenChange }: BranchEditDialogProps) {
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const { update } = useBranchesMutation();
  const { findAllDepartments } = useDepartmentsQuery({ page, limit: ITEMS_PER_PAGE, search })

  const form = useForm<BranchSchemaType>({
    resolver: zodResolver(BranchSchema),
    defaultValues: {
      name: branch.name,
      address: branch.address,
      departmentId: branch.department.id,
    },
  });

  useEffect(() => {
    if (open && branch) {
      form.reset({
        name: branch.name,
        address: branch.address,
        departmentId: branch.department.id,
      });
    }
  }, [open, branch, form]);

  async function onSubmit(values: BranchSchemaType) {
    toast.promise(update.mutateAsync({ id: branch.id, values }), {
      loading: "Actualizando sucursal...",
      success: (data) => {
        onOpenChange(false);
        return `Sucursal "${data.name}" actualizada exitosamente`;
      },
      error: (error) => error.message || "Error desconocido",
    });
  }

  const departments = useMemo<PaginatedItem[]>(() => {
    return findAllDepartments.data?.data.map((role) => ({
      id: role.id,
      label: role.name,
    })) ?? []
  }, [findAllDepartments.data])

  const handleDialogClose = () => {
    onOpenChange(false)
    setPage(1)
    setSearch("")
  }
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        handleDialogClose()
      } else {
        onOpenChange(value)
      }
    }}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Sucursal</DialogTitle>
          <DialogDescription>
            Modifique los datos de la sucursal y guarde los cambios.
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
                    <Input {...field} disabled={update.isPending} />
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
                      disabled={update.isPending}
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
                      placeholder="Seleccione un departamento..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={update.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Actualizar Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
