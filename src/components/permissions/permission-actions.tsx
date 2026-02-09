"use client"

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PermissionEditDialog from "@/components/permissions/permission-edit-dialog";
import { PermissionDeleteDialog } from "@/components/permissions/permission-delete-dialog";
import { Permission } from "@/types/permission";
import { Protected } from "@/components/auth/protected";

interface PermissionActionsProps {
  permission: Permission;
}

export function PermissionActions({ permission }: PermissionActionsProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(permission.id)}
          >
            Copiar ID del permiso
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          <Protected permissions={["editar permisos"]}>
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          </Protected>
          <Protected permissions={["eliminar permisos"]}>
            <DropdownMenuItem 
              className="flex items-center text-destructive focus:text-destructive cursor-pointer"
              onClick={() => setOpenDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </Protected>
        </DropdownMenuContent>
      </DropdownMenu>
      <PermissionEditDialog
        permission={permission}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />
      <PermissionDeleteDialog
        permission={permission}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
