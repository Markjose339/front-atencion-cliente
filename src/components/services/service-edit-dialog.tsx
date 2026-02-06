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

import { Service } from "@/types/service";
import { ServiceSchema, ServiceSchemaType } from "@/lib/schemas/service.schema";
import { useServicesMutation } from "@/hooks/use-services";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ServiceEditDialogProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceEditDialog({
  service,
  open,
  onOpenChange,
}: ServiceEditDialogProps) {
  const { update } = useServicesMutation();

  const form = useForm<ServiceSchemaType>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: service.name,
      abbreviation: service.abbreviation,
      code: service.code,
    },
  });

  useEffect(() => {
    if (open && service) {
      form.reset({
        name: service.name,
        abbreviation: service.abbreviation,
        code: service.code,
      });
    }
  }, [open, service, form]);

  async function onSubmit(values: ServiceSchemaType) {
    toast.promise(update.mutateAsync({ id: service.id, values }), {
      loading: "Actualizando servicio...",
      success: (data) => {
        onOpenChange(false);
        return `Servicio "${data.name}" actualizado exitosamente`;
      },
      error: (error) => error.message || "Error desconocido",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Servicio</DialogTitle>
          <DialogDescription>
            Modifique los datos del servicio y guarde los cambios.
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
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase().replace(/\s+/g, "");
                        field.onChange(v);
                      }}
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
                      value={field.value}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase().replace(/\s+/g, "");
                        field.onChange(v);
                      }}
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
                {update.isPending ? "Guardando..." : "Actualizar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
