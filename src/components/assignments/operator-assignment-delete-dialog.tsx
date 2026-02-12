"use client";

import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useOperatorAssignmentsMutation } from "@/hooks/use-assignments";
import { OperatorAssignment } from "@/types/assignment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface OperatorAssignmentDeleteDialogProps {
  assignment: OperatorAssignment;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function OperatorAssignmentDeleteDialog({
  assignment,
  open,
  onOpenChange,
}: OperatorAssignmentDeleteDialogProps) {
  const { remove } = useOperatorAssignmentsMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(assignment.id), {
      loading: "Eliminando asignacion...",
      success: () => "Asignacion eliminada",
      error: (error) => (error as { message?: string })?.message ?? "Error al eliminar",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Eliminar asignacion de operador</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta accion no se puede deshacer.
          </AlertDialogDescription>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="destructive">{assignment.user.name}</Badge>
            <Badge variant="secondary">{assignment.branch.name}</Badge>
            <Badge variant="outline">{assignment.window.name}</Badge>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={remove.isPending}
            variant="destructive"
          >
            {remove.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
