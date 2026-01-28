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
import { Role } from "@/types/role";
import { useRolesMutation } from "@/hooks/use-roles";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

interface RoleDeleteDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleDeleteDialog({
  role,
  open,
  onOpenChange
}: RoleDeleteDialogProps) {
  const { remove } = useRolesMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(role.id), {
      loading: "Eliminando rol...",
      success: (data) => `Rol "${data.name}" eliminado correctamente`,
      error: (error) => error.message || "Error al eliminar el rol"
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
              ¿Estás seguro de eliminar este rol?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2 space-y-3">
            Esta acción no se puede deshacer. El rol será eliminado permanentemente del sistema
          </AlertDialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rol
            </span>
            <Badge variant="destructive">
              {role.name}
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
            className="bg-destructive hover:bg-destructive/90"
          >
            {remove.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
