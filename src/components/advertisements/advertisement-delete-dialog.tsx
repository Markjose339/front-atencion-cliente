"use client";

import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useAdvertisementsMutation } from "@/hooks/use-advertisements";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Advertisement } from "@/types/advertisement";

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

interface AdvertisementDeleteDialogProps {
  advertisement: Advertisement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvertisementDeleteDialog({
  advertisement,
  open,
  onOpenChange,
}: AdvertisementDeleteDialogProps) {
  const { remove } = useAdvertisementsMutation();

  const handleDelete = async () => {
    try {
      const removed = await remove.mutateAsync(advertisement.id);
      onOpenChange(false);
      toast.success(`Publicidad "${removed.title}" eliminada`);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "No se pudo eliminar la publicidad"));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Eliminar publicidad</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2">
            Esta accion no se puede deshacer. La publicidad sera eliminada permanentemente.
          </AlertDialogDescription>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Publicidad</span>
            <Badge variant="destructive">{advertisement.title}</Badge>
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
