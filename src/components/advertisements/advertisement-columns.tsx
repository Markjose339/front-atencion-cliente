"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import {
  formatDateTime,
  humanizeDisplayMode,
  humanizeMediaType,
  isAdvertisementActiveNow,
} from "@/hooks/use-advertisements";
import { AdvertisementActions } from "@/components/advertisements/advertisement-actions";
import { AdvertisementPreview } from "@/components/advertisements/advertisement-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Advertisement, AdvertisementOptions } from "@/types/advertisement";

export const advertisementColumns = (
  options: AdvertisementOptions,
): ColumnDef<Advertisement>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Titulo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const advertisement = row.original;
      const secondaryText =
        advertisement.mediaType === "TEXT"
          ? advertisement.textContent?.trim() || "Sin texto"
          : advertisement.mimeType?.trim() || "Contenido multimedia";

      return (
        <div className="space-y-1">
          <p className="font-medium">{advertisement.title}</p>
          <p className="max-w-[28ch] truncate text-xs text-muted-foreground">{secondaryText}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "mediaType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.original.mediaType;
      const variant = value === "VIDEO" ? "secondary" : "default";

      return <Badge variant={variant}>{humanizeMediaType(value)}</Badge>;
    },
  },
  {
    accessorKey: "displayMode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Modo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => humanizeDisplayMode(row.original.displayMode),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Activo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const advertisement = row.original;
      const activeNow = isAdvertisementActiveNow(advertisement);

      return (
        <div className="flex flex-col gap-1">
          <Badge variant={advertisement.isActive ? "default" : "outline"}>
            {advertisement.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {activeNow ? "Visible ahora" : "Fuera de vigencia"}
          </span>
        </div>
      );
    },
  },
  {
    id: "validity",
    header: "Vigencia",
    cell: ({ row }) => {
      const { startsAt, endsAt } = row.original;

      return (
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-medium">Inicio:</span> {formatDateTime(startsAt)}
          </p>
          <p>
            <span className="font-medium">Fin:</span> {formatDateTime(endsAt)}
          </p>
        </div>
      );
    },
  },
  {
    id: "preview",
    header: "Preview",
    cell: ({ row }) => (
      <AdvertisementPreview
        fileUrl={row.original.fileUrl}
        mediaType={row.original.mediaType}
        textContent={row.original.textContent}
        title={row.original.title}
      />
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <AdvertisementActions advertisement={row.original} options={options} />,
  },
];
