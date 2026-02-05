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
import { Branch } from "@/types/branch";
import { toast } from "sonner";
import { useBranchesMutation } from "@/hooks/use-branches";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BranchDeleteDialogProps {
  branch: Branch;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function BranchDeleteDialog({ branch, open, onOpenChange }: BranchDeleteDialogProps) {
  const { remove } = useBranchesMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(branch.id), {
      loading: "Eliminando sucursal...",
      success: (data) => `Sucursal "${data.name}" eliminada exitosamente`,
      error: (error) => error.message || "Error al eliminar la sucursal",
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
            <AlertDialogTitle>¿Estás seguro de eliminar esta sucursal?</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. La sucursal será eliminada permanentemente del sistema.
          </AlertDialogDescription>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Sucursal</span>
            <Badge variant="destructive">
              {branch.name} ({branch.name})
            </Badge>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={remove.isPending} variant="destructive">
            {remove.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
