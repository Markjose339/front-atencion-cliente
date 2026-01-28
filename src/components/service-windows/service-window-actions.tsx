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
import { ServiceWindowDeleteDialog } from "./service-window-delete-dialog";
import { ServiceWindow } from "@/types/service-window";
import ServiceWindowEditDialog from "./service-window-edit-dialog";

interface PermissionActionsProps {
  serviceWindow: ServiceWindow;
}

export function ServiceWindowActions({ serviceWindow }: PermissionActionsProps) {
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
            onClick={() => navigator.clipboard.writeText(serviceWindow.id)}
          >
            Copiar ID de la ventanilla
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center text-destructive focus:text-destructive cursor-pointer"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ServiceWindowEditDialog
        serviceWindow={serviceWindow}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />
      <ServiceWindowDeleteDialog
        serviceWindow={serviceWindow}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
