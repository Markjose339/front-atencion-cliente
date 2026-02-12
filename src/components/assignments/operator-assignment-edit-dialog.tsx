"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  UpdateOperatorAssignmentSchema,
  UpdateOperatorAssignmentSchemaType,
} from "@/lib/schemas/assignment.schema";
import { useOperatorAssignmentsMutation } from "@/hooks/use-assignments";
import { OperatorAssignment } from "@/types/assignment";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

interface OperatorAssignmentEditDialogProps {
  assignment: OperatorAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OperatorAssignmentEditDialog({
  assignment,
  open,
  onOpenChange,
}: OperatorAssignmentEditDialogProps) {
  const { update } = useOperatorAssignmentsMutation();

  const form = useForm<UpdateOperatorAssignmentSchemaType>({
    resolver: zodResolver(UpdateOperatorAssignmentSchema),
    defaultValues: {
      isActive: assignment.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ isActive: assignment.isActive });
    }
  }, [open, assignment.isActive, form]);

  const onSubmit = async (values: UpdateOperatorAssignmentSchemaType) => {
    toast.promise(update.mutateAsync({ id: assignment.id, values }), {
      loading: "Actualizando asignacion...",
      success: () => {
        onOpenChange(false);
        return "Asignacion actualizada";
      },
      error: (error) => (error as { message?: string })?.message ?? "Error al actualizar",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar asignacion de operador</DialogTitle>
          <DialogDescription>
            Solo puedes activar o desactivar la asignacion.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border p-3 text-sm">
              <p>
                <strong>Operador:</strong> {assignment.user.name} ({assignment.user.email})
              </p>
              <p>
                <strong>Sucursal:</strong> {assignment.branch.name}
              </p>
              <p>
                <strong>Ventanilla:</strong> {assignment.window.name} ({assignment.window.code})
              </p>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-checked:border-primary has-checked:bg-primary/5">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={update.isPending}
                      />

                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">Asignacion activa</p>
                        <p className="text-muted-foreground text-sm">
                          Desactiva para impedir que opere en esta ventanilla.
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
                {update.isPending ? "Guardando..." : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
