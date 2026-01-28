"use client";

import { PermissionSchema, PermissionSchemaType } from "@/lib/schemas/permission.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePermissionsMutation } from "@/hooks/use-permissions";
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

export function PermissionCreateDialog() {
  const [open, setOpen] = useState(false);
  const { create } = usePermissionsMutation();

  const form = useForm<PermissionSchemaType>({
    resolver: zodResolver(PermissionSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: PermissionSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando permiso...",
      success: (data) => {
        setOpen(false)
        form.reset();
        return `Permiso "${data.name}" creado exitosamente`
      },
      error: (error) => error.message
    });
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Permiso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Permiso</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo permiso en el sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Permiso</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del permiso (ej: users create)"
                      {...field}
                      disabled={create.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={create.isPending}
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Permiso"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
