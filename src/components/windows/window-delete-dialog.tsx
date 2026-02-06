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
import { Window } from "@/types/window";
import { toast } from "sonner";
import { useWindowsMutation } from "@/hooks/use-windows";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WindowDeleteDialogProps {
  window: Window;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function WindowDeleteDialog({ window, open, onOpenChange }: WindowDeleteDialogProps) {
  const { remove } = useWindowsMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(window.id), {
      loading: "Eliminando ventana...",
      success: (data) => `Ventana "${data.name}" eliminada exitosamente`,
      error: (error) => error.message || "Error al eliminar la ventana",
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
            <AlertDialogTitle>¿Estás seguro de eliminar esta ventana?</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. La ventana será eliminada permanentemente.
          </AlertDialogDescription>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Ventana</span>
            <Badge variant="destructive">{window.name}</Badge>
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
