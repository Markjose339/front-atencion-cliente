import { useUsersMutation } from "@/hooks/use-users";
import { User } from "@/types/user";
import { toast } from "sonner";
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
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserDeleteDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function UserDeleteDialog({
  user,
  open,
  onOpenChange,
}: UserDeleteDialogProps) {
  const { remove } = useUsersMutation();

  const handleDelete = async () => {
    toast.promise(remove.mutateAsync(user.id), {
      loading: "Eliminando usuario...",
      success: (data) => `Usuario "${data.name}" eliminado correctamente`,
      error: (error: Error) => error.message
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
              ¿Estás seguro de eliminar este usuario?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="pt-2 space-y-3">
            Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema
          </AlertDialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Usuario
            </span>
            <Badge variant="destructive">
              {user.name}
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