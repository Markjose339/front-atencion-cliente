"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { OperatorAssignment } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Protected } from "@/components/auth/protected";

import OperatorAssignmentEditDialog from "./operator-assignment-edit-dialog";
import { OperatorAssignmentDeleteDialog } from "./operator-assignment-delete-dialog";

interface OperatorAssignmentActionsProps {
  assignment: OperatorAssignment;
}

export function OperatorAssignmentActions({ assignment }: OperatorAssignmentActionsProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(assignment.id)}>
            Copiar ID de asignacion
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <Protected permissions={["editar asignaciones"]}>
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar estado</span>
            </DropdownMenuItem>
          </Protected>

          <Protected permissions={["eliminar asignaciones"]}>
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

      <OperatorAssignmentEditDialog
        assignment={assignment}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />

      <OperatorAssignmentDeleteDialog
        assignment={assignment}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
