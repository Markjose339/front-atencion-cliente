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
import { useEffect } from "react";
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
import { Department } from "@/types/department";
import { useDepartmentsMutation } from "@/hooks/use-departments";
import { DepartmentSchema, DepartmentSchemaType } from "@/lib/schemas/department";

interface DepartmentEditDialogProps {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepartmentEditDialog({
  department,
  open,
  onOpenChange,
}: DepartmentEditDialogProps) {
  const { update } = useDepartmentsMutation();

  const form = useForm<DepartmentSchemaType>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      name: department.name,
      code: department.code,
    },
  });

  useEffect(() => {
    if (open && department) {
      form.reset({
        name: department.name,
        code: department.code,
      });
    }
  }, [open, department, form]);

  async function onSubmit(values: DepartmentSchemaType) {
    toast.promise(update.mutateAsync({ id: department.id, values }), {
      loading: "Actualizando departamento...",
      success: (data) => {
        onOpenChange(false);
        return `Departamento "${data.name}" actualizado exitosamente`;
      },
      error: (error) => error.message || "Error desconocido",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Departamento</DialogTitle>
          <DialogDescription>
            Modifique los datos del departamento y guarde los cambios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Departamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del departamento"
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Código (ej: ADM-01)"
                      {...field}
                      disabled={update.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={update.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Actualizar Departamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
