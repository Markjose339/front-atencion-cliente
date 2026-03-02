"use client";

import { useCallback, useMemo } from "react";
import { AlertCircle, FilterX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { advertisementColumns } from "@/components/advertisements/advertisement-columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  humanizeDisplayMode,
  humanizeMediaType,
  useAdvertisementOptionsQuery,
  useAdvertisementsQuery,
} from "@/hooks/use-advertisements";
import {
  ADVERTISEMENT_DISPLAY_MODES,
  ADVERTISEMENT_MEDIA_TYPES,
} from "@/types/advertisement";

const normalizePositiveNumber = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeMediaType = (value: string | null) =>
  ADVERTISEMENT_MEDIA_TYPES.includes(value as (typeof ADVERTISEMENT_MEDIA_TYPES)[number])
    ? (value as (typeof ADVERTISEMENT_MEDIA_TYPES)[number])
    : "";

const normalizeDisplayMode = (value: string | null) =>
  ADVERTISEMENT_DISPLAY_MODES.includes(value as (typeof ADVERTISEMENT_DISPLAY_MODES)[number])
    ? (value as (typeof ADVERTISEMENT_DISPLAY_MODES)[number])
    : "";

const normalizeBooleanFilter = (value: string | null): "" | "true" | "false" =>
  value === "true" || value === "false" ? value : "";

export function AdvertisementsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = normalizePositiveNumber(searchParams.get("page"), 1);
  const limit = normalizePositiveNumber(searchParams.get("limit"), 10);
  const search = searchParams.get("search") ?? "";
  const mediaType = normalizeMediaType(searchParams.get("mediaType"));
  const displayMode = normalizeDisplayMode(searchParams.get("displayMode"));
  const isActive = normalizeBooleanFilter(searchParams.get("isActive"));
  const activeNow = normalizeBooleanFilter(searchParams.get("activeNow"));

  const { findAdvertisementOptions } = useAdvertisementOptionsQuery();
  const { findAllAdvertisements } = useAdvertisementsQuery({
    page,
    limit,
    search,
    mediaType,
    displayMode,
    isActive,
    activeNow,
  });

  const options = useMemo(
    () =>
      findAdvertisementOptions.data ?? {
        mediaTypes: [...ADVERTISEMENT_MEDIA_TYPES],
        displayModes: [...ADVERTISEMENT_DISPLAY_MODES],
      },
    [findAdvertisementOptions.data],
  );

  const updateURL = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      mediaType?: string;
      displayMode?: string;
      isActive?: string;
      activeNow?: string;
    }) => {
      const next = {
        page,
        limit,
        search,
        mediaType,
        displayMode,
        isActive,
        activeNow,
        ...updates,
      };

      const params = new URLSearchParams();
      params.set("page", String(next.page));
      params.set("limit", String(next.limit));

      if (next.search.trim()) {
        params.set("search", next.search.trim());
      }

      if (next.mediaType) {
        params.set("mediaType", next.mediaType);
      }

      if (next.displayMode) {
        params.set("displayMode", next.displayMode);
      }

      if (next.isActive) {
        params.set("isActive", next.isActive);
      }

      if (next.activeNow) {
        params.set("activeNow", next.activeNow);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, page, limit, search, mediaType, displayMode, isActive, activeNow],
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      updateURL({ page: pagination.pageIndex + 1, limit: pagination.pageSize });
    },
    [updateURL],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({ page: 1, search: value });
    },
    [updateURL],
  );

  const hasAppliedFilters =
    Boolean(mediaType) || Boolean(displayMode) || Boolean(isActive) || Boolean(activeNow);

  if (findAllAdvertisements.error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">
          Ocurrio un error: {(findAllAdvertisements.error as { message?: string }).message ?? "Error desconocido"}
        </p>
        <Button variant="outline" onClick={() => findAllAdvertisements.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          value={mediaType || "all"}
          onValueChange={(value) => updateURL({ page: 1, mediaType: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {options.mediaTypes.map((option) => (
              <SelectItem key={option} value={option}>
                {humanizeMediaType(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={displayMode || "all"}
          onValueChange={(value) =>
            updateURL({ page: 1, displayMode: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Modo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los modos</SelectItem>
            {options.displayModes.map((option) => (
              <SelectItem key={option} value={option}>
                {humanizeDisplayMode(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isActive || "all"}
          onValueChange={(value) => updateURL({ page: 1, isActive: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="true">Activas</SelectItem>
            <SelectItem value="false">Inactivas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={activeNow || "all"}
          onValueChange={(value) => updateURL({ page: 1, activeNow: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Activas ahora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sin filtro de vigencia</SelectItem>
            <SelectItem value="true">Visibles ahora</SelectItem>
            <SelectItem value="false">No visibles ahora</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          disabled={!hasAppliedFilters}
          onClick={() =>
            updateURL({
              page: 1,
              mediaType: "",
              displayMode: "",
              isActive: "",
              activeNow: "",
            })
          }
        >
          <FilterX className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      </section>

      <DataTable
        columns={advertisementColumns(options)}
        data={findAllAdvertisements.data?.data ?? []}
        loading={findAllAdvertisements.isLoading}
        pageCount={findAllAdvertisements.data?.meta?.totalPages ?? 0}
        pageIndex={page - 1}
        pageSize={limit}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        searchValue={search}
        searchPlaceholder="Buscar publicidades..."
        totalItems={findAllAdvertisements.data?.meta?.total ?? 0}
      />
    </div>
  );
}
