"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { WindowSchema, WindowSchemaType } from "@/lib/schemas/window.schema";
import { useWindowsMutation } from "@/hooks/use-windows";

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
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function WindowCreateDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useWindowsMutation();

  const form = useForm<WindowSchemaType>({
    resolver: zodResolver(WindowSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: WindowSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando ventana...",
      success: (data) => {
        setOpen(false);
        form.reset();
        return `Ventana "${data.name}" creada exitosamente`;
      },
      error: (error) => error.message,
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
          Nueva Ventana
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Crear Nueva Ventana</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva ventana.
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
                    <Input
                      placeholder="Nombre de la ventana"
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
                {create.isPending ? "Guardando..." : "Guardar Ventana"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
