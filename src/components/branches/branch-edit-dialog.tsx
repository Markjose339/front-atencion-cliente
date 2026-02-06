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
import {
  BranchSchema,
  type BranchSchemaType,
  BOLIVIA_DEPARTMENTS,
} from "@/lib/schemas/branch.schema";
import { useBranchesMutation } from "@/hooks/use-branches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface BranchEditDialogProps {
  branch: Branch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BranchEditDialog({
  branch,
  open,
  onOpenChange,
}: BranchEditDialogProps) {
  const { update } = useBranchesMutation();

  const form = useForm<BranchSchemaType>({
    resolver: zodResolver(BranchSchema),
    defaultValues: {
      name: branch.name,
      address: branch.address,
      departmentName: branch.departmentName ?? "", 
    },
  });

  useEffect(() => {
    if (open && branch) {
      form.reset({
        name: branch.name,
        address: branch.address,
        departmentName: branch.departmentName ?? "",
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

  const handleDialogClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleDialogClose();
        else onOpenChange(value);
      }}
    >
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
                  <FormLabel>Dirección</FormLabel>
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
              name="departmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""} 
                      onValueChange={field.onChange}
                      disabled={update.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un departamento..." />
                      </SelectTrigger>

                      <SelectContent>
                        {BOLIVIA_DEPARTMENTS.map((dep) => (
                          <SelectItem key={dep} value={dep}>
                            {dep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {update.isPending ? "Guardando..." : "Actualizar Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
