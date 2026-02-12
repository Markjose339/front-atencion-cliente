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

export function WindowCreateDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useWindowsMutation();

  const form = useForm<WindowSchemaType>({
    resolver: zodResolver(WindowSchema),
    defaultValues: { name: "", code: "", isActive: true },
  });

  async function onSubmit(values: WindowSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando ventanilla...",
      success: (data) => {
        setOpen(false);
        form.reset({ name: "", code: "", isActive: true });
        return `Ventanilla "${data.name}" creada exitosamente`;
      },
      error: (error) => error?.message || "Error desconocido",
    });
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) form.reset({ name: "", code: "", isActive: true });
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
          <DialogTitle>Crear Nueva Ventanilla</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva ventanilla.
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
                      placeholder="Nombre de la ventanilla"
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
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: VENT-01"
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
                        disabled={create.isPending}
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
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset({ name: "", code: "", isActive: true })}
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
