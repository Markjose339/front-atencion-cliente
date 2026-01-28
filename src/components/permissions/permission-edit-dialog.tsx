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
import { Permission } from "@/types/permission";
import { PermissionSchema, PermissionSchemaType } from "@/lib/schemas/permission.schema";
import { usePermissionsMutation } from "@/hooks/use-permissions";

interface PermissionEditDialogProps {
  permission: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PermissionEditDialog({ permission, open, onOpenChange }: PermissionEditDialogProps) {
  const { update } = usePermissionsMutation()

  const form = useForm<PermissionSchemaType>({
    resolver: zodResolver(PermissionSchema),
    defaultValues: {
      name: permission.name,
    },
  })

  useEffect(() => {
    if (open && permission) {
      form.reset({
        name: permission.name,
      })
    }
  }, [open, permission, form])

  async function onSubmit(values: PermissionSchemaType) {
    toast.promise(update.mutateAsync({ id: permission.id, values }), {
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
            Modifique los datos del permiso y guarde los cambios.
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
                      placeholder="Nombre del permiso (ej: users.create)"
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
                {update.isPending ? "Guardando..." : "Actualizar Permiso"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}