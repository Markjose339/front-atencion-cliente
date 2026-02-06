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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Window } from "@/types/window";
import { WindowSchema, WindowSchemaType } from "@/lib/schemas/window.schema";
import { useWindowsMutation } from "@/hooks/use-windows";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface WindowEditDialogProps {
  window: Window;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WindowEditDialog({ window, open, onOpenChange }: WindowEditDialogProps) {
  const { update } = useWindowsMutation();

  const form = useForm<WindowSchemaType>({
    resolver: zodResolver(WindowSchema),
    defaultValues: { name: window.name },
  });

  useEffect(() => {
    if (open && window) {
      form.reset({ name: window.name });
    }
  }, [open, window, form]);

  async function onSubmit(values: WindowSchemaType) {
    toast.promise(update.mutateAsync({ id: window.id, values }), {
      loading: "Actualizando ventana...",
      success: (data) => {
        onOpenChange(false);
        return `Ventana "${data.name}" actualizada exitosamente`;
      },
      error: (error) => error.message || "Error desconocido",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Ventana</DialogTitle>
          <DialogDescription>
            Modifique el nombre de la ventana y guarde los cambios.
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
                {update.isPending ? "Guardando..." : "Actualizar Ventana"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
