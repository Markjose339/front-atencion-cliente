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
import { Window } from "@/types/window";
import WindowEditDialog from "@/components/windows/window-edit-dialog";
import { WindowDeleteDialog } from "@/components/windows/window-delete-dialog";
import { Protected } from "@/components/auth/protected";

interface WindowActionsProps {
  window: Window;
}

export function WindowActions({ window }: WindowActionsProps) {
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

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.id)}>
            Copiar ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <Protected permissions={["editar ventanillas"]}>
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          </Protected>

          <Protected permissions={["eliminar ventanillas"]}>
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

      <WindowEditDialog window={window} open={openEditDialog} onOpenChange={setOpenEditDialog} />
      <WindowDeleteDialog window={window} open={openDeleteDialog} onOpenChange={setOpenDeleteDialog} />
    </div>
  );
}
