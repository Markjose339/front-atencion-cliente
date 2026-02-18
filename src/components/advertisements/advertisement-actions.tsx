"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Advertisement, AdvertisementOptions } from "@/types/advertisement";

import { AdvertisementDeleteDialog } from "@/components/advertisements/advertisement-delete-dialog";
import { AdvertisementEditDialog } from "@/components/advertisements/advertisement-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdvertisementActionsProps {
  advertisement: Advertisement;
  options: AdvertisementOptions;
}

export function AdvertisementActions({ advertisement, options }: AdvertisementActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(advertisement.id).catch(() => {
                // No-op: clipboard may be blocked in insecure contexts.
              });
            }}
          >
            Copiar ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdvertisementEditDialog
        advertisement={advertisement}
        options={options}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AdvertisementDeleteDialog
        advertisement={advertisement}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
