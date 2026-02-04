"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { useServiceWindowsMutation } from "@/hooks/use-service-windows";
import { ServiceWindowsSchema, ServiceWindowsSchemaType } from "@/lib/schemas/service-windows.schema";

export function ServiceWindowCreateDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useServiceWindowsMutation();

  const form = useForm<ServiceWindowsSchemaType>({
    resolver: zodResolver(ServiceWindowsSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  async function onSubmit(values: ServiceWindowsSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando servicio...",
      success: (data) => {
        setOpen(false)
        form.reset();
        return `servicio "${data.name}" creado exitosamente`
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
          Nueva Ventanilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ventanilla</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva ventanilla en el sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la ventanilla</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la ventanilla (ej: ventanilla 1)"
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codigo de la ventanilla</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Codigo de la ventanilla (ej: DD)"
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
                {create.isPending ? "Guardando..." : "Guardar Ventanilla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
