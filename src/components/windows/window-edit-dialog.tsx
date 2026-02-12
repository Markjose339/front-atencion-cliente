"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Window } from "@/types/window";
import { WindowSchema, WindowSchemaType } from "@/lib/schemas/window.schema";
import { useWindowsMutation } from "@/hooks/use-windows";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface WindowEditDialogProps {
  window: Window;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WindowEditDialog({
  window,
  open,
  onOpenChange,
}: WindowEditDialogProps) {
  const { update } = useWindowsMutation();

  const form = useForm<WindowSchemaType>({
    resolver: zodResolver(WindowSchema),
    defaultValues: {
      name: window.name,
      code: window.code,
      isActive: window.isActive,
    },
  });

  useEffect(() => {
    if (open && window) {
      form.reset({
        name: window.name,
        code: window.code,
        isActive: window.isActive,
      });
    }
  }, [open, window, form]);

  async function onSubmit(values: WindowSchemaType) {
    toast.promise(update.mutateAsync({ id: window.id, values }), {
      loading: "Actualizando ventanilla...",
      success: (data) => {
        onOpenChange(false);
        return `Ventanilla "${data.name}" actualizada exitosamente`;
      },
      error: (error) => error?.message || "Error desconocido",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Ventanilla</DialogTitle>
          <DialogDescription>
            Modifique los datos de la ventanilla y guarde los cambios.
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={update.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Checkbox + Label (como tu ejemplo) */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label
                      className="
                        hover:bg-accent/50
                        flex items-start gap-3
                        rounded-lg border p-3
                        cursor-pointer transition-colors
                        has-checked:border-primary
                        has-checked:bg-primary/5
                      "
                    >
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={update.isPending}
                      />

                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Ventanilla activa
                        </p>
                        <p className="text-muted-foreground text-sm">
                          La ventanilla estará disponible para atención al público.
                        </p>
                      </div>
                    </Label>
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
                {update.isPending ? "Guardando..." : "Actualizar Ventanilla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
