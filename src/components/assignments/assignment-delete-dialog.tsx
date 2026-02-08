"use client";

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
import { Assignment } from "@/types/assignment";
import { useAssignmentsMutation } from "@/hooks/use-assignments";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

interface AssignmentDeleteDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function AssignmentDeleteDialog({
  assignment,
  open,
  onOpenChange,
}: AssignmentDeleteDialogProps) {
  const { remove } = useAssignmentsMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(assignment.id), {
      loading: "Eliminando asignación...",
      success: () => "Asignación eliminada exitosamente",
      error: (error) => error.message || "Error al eliminar la asignación",
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
            <AlertDialogTitle>
              ¿Estás seguro de eliminar esta asignación?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. La asignación serÃ¡ eliminada permanentemente.
          </AlertDialogDescription>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Asignación</span>
            <Badge variant="destructive">
              {assignment.branch?.name ?? "—"} - {assignment.window?.name ?? "—"}
            </Badge>
            <Badge variant="secondary">
              {assignment.service?.name ?? "—"} ({assignment.service?.abbreviation ?? "—"})
            </Badge>
            <Badge variant="outline">{assignment.user?.name ?? "—"}</Badge>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>
            Cancelar
          </AlertDialogCancel>
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
