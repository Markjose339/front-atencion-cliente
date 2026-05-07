"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { ServiceSchema, ServiceSchemaType } from "@/lib/schemas/service.schema";
import { useServicesMutation } from "@/hooks/use-services";

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

export function ServiceCreateDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useServicesMutation();

  const form = useForm<ServiceSchemaType>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      code: true,
      isActive: true,
    },
  });

  async function onSubmit(values: ServiceSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando servicio...",
      success: (data) => {
        setOpen(false);
        form.reset({
          name: "",
          abbreviation: "",
          code: true,
          isActive: true,
        });
        return `Servicio "${data.name}" creado exitosamente`;
      },
      error: (error) => error?.message || "Error desconocido",
    });
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      form.reset({
        name: "",
        abbreviation: "",
        code: true,
        isActive: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Servicio</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo servicio en el sistema.
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
                      placeholder="Nombre del servicio"
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
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Abreviatura (ej: EMS)"
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, "");
                        field.onChange(value);
                      }}
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
                  <FormControl>
                    <FieldLabel>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                          disabled={create.isPending}
                        />

                        <FieldContent>
                          <FieldTitle>¿Requiere código?</FieldTitle>
                          <FieldDescription>
                            Active esta opción si el servicio necesita generar o
                            manejar códigos de seguimiento.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
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
                    <FieldLabel>
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                          disabled={create.isPending}
                        />

                        <FieldContent>
                          <FieldTitle>Servicio activo</FieldTitle>
                          <FieldDescription>
                            Active esta opción para que el servicio esté
                            disponible en el sistema.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
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
                  onClick={() =>
                    form.reset({
                      name: "",
                      abbreviation: "",
                      code: true,
                      isActive: true,
                    })
                  }
                  disabled={create.isPending}
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}