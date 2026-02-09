"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role } from "@/types/role";
import { RoleDeleteDialog } from "./role-delete-dialog";
import { RoleEditDialog } from "./role-edit-dialog";
import { Protected } from "@/components/auth/protected";

interface RoleActionsProps {
  role: Role;
}

export function RoleActions({ role }: RoleActionsProps) {
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
            onClick={() => navigator.clipboard.writeText(role.id)}
          >
            Copiar ID del rol
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          <Protected permissions={["editar roles"]}>
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          </Protected>
          <Protected permissions={["eliminar roles"]}>
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
      <RoleEditDialog
        role={role}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />
      <RoleDeleteDialog
        role={role}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
