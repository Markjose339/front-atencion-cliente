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
import { Service } from "@/types/service";
import ServiceEditDialog from "./service-edit-dialog";
import { ServiceDeleteDialog } from "./service-delete-dialog";
import { Protected } from "@/components/auth/protected";

interface ServiceActionsProps {
  service: Service;
}

export function ServiceActions({ service }: ServiceActionsProps) {
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

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(service.id)}>
            Copiar ID del servicio
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <Protected permissions={["editar servicios"]}>
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          </Protected>

          <Protected permissions={["eliminar servicios"]}>
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

      <ServiceEditDialog
        service={service}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />

      <ServiceDeleteDialog
        service={service}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
