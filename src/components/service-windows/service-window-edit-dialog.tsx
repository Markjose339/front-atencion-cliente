"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ServiceWindow } from "@/types/service-window";
import { ServiceWindowsSchema, ServiceWindowsSchemaType } from "@/lib/schemas/service-windows.schema";
import { useServiceWindowsMutation } from "@/hooks/use-service-windows";

interface ServiceWindowEditDialogProps {
  serviceWindow: ServiceWindow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ServiceWindowEditDialog({ serviceWindow, open, onOpenChange }: ServiceWindowEditDialogProps) {
  const { update } = useServiceWindowsMutation()

  const form = useForm<ServiceWindowsSchemaType>({
    resolver: zodResolver(ServiceWindowsSchema),
    defaultValues: {
      name: serviceWindow.name,
      code: serviceWindow.code,
    },
  })

  useEffect(() => {
    if (open && serviceWindow) {
      form.reset({
        name: serviceWindow.name,
        code: serviceWindow.code,
      })
    }
  }, [open, serviceWindow, form])

  async function onSubmit(values: ServiceWindowsSchemaType) {
    toast.promise(update.mutateAsync({ id: serviceWindow.id, values }), {
      loading: 'Actualizando permiso...',
      success: (data) => {
        onOpenChange(false)
        return `Permiso "${data.name}" actualizado exitosamente`
      },
      error: (error) => error.message || 'Error desconocido'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Permiso</DialogTitle>
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
                  <FormLabel>Nombre de la ventanilla</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la ventanilla (ej: ventanilla 1)"
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
                  <FormLabel>Codigo de la ventanilla</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Codigo de la ventanilla (ej: DD)"
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
                {update.isPending ? "Guardando..." : "Actualizar Ventanilla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}