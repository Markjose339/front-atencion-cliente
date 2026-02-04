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
import { Permission } from "@/types/permission";
import { toast } from "sonner";
import { usePermissionsMutation } from "@/hooks/use-permissions";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PermissionDeleteDialogProps {
  permission: Permission
  open: boolean
  onOpenChange: (val: boolean) => void
}

export function PermissionDeleteDialog({ permission, open, onOpenChange }: PermissionDeleteDialogProps) {
  const { remove } = usePermissionsMutation()

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(permission.id), {
      loading: 'Eliminando permiso...',
      success: (data) => `Permiso "${data.name}" eliminado exitosamente`,
      error: (error) => error.message || 'Error al eliminar el permiso'
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
              ¿Estás seguro de eliminar este permiso?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 space-y-3">
            Esta acción no se puede deshacer. El permiso será eliminado permanentemente del sistema
          </AlertDialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Permiso
            </span>
            <Badge variant="destructive">
              {permission.name}
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