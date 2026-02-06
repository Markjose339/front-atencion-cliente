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
import { Service } from "@/types/service";
import { toast } from "sonner";
import { useServicesMutation } from "@/hooks/use-services";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceDeleteDialogProps {
  service: Service;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function ServiceDeleteDialog({
  service,
  open,
  onOpenChange,
}: ServiceDeleteDialogProps) {
  const { remove } = useServicesMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(service.id), {
      loading: "Eliminando servicio...",
      success: (data) => `Servicio "${data.name}" eliminado exitosamente`,
      error: (error) => error.message || "Error al eliminar el servicio",
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
              ¿Estás seguro de eliminar este servicio?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
          </AlertDialogDescription>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Servicio</span>
            <Badge variant="destructive">
              {service.name} ({service.code})
            </Badge>
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
