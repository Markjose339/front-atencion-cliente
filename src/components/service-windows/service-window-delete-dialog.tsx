import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceWindow } from "@/types/service-window";
import { useServiceWindowsMutation } from "@/hooks/use-service-windows";

interface ServiceWindowDeleteDialogProps {
  serviceWindow: ServiceWindow
  open: boolean
  onOpenChange: (val: boolean) => void
}

export function ServiceWindowDeleteDialog({ serviceWindow, open, onOpenChange }: ServiceWindowDeleteDialogProps) {
  const { remove } = useServiceWindowsMutation()

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(serviceWindow.id), {
      loading: 'Eliminando permiso...',
      success: (data) => `Ventanilla "${data.name}" eliminado exitosamente`,
      error: (error) => error.message || 'Error al eliminar la ventanilla'
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar esta ventanilla?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 space-y-3">
            Esta acción no se puede deshacer. La ventanilla será eliminado permanentemente del sistema
          </AlertDialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Ventanilla
            </span>
            <Badge variant="destructive">
              {serviceWindow.name}
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
  )
}