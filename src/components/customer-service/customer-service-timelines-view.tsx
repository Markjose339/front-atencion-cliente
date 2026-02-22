"use client";

import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useAllBranchesQuery } from "@/hooks/use-branches";
import { useCustomerServiceTimelinesQuery } from "@/hooks/use-customer-service-timelines";

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { customerServiceTimelinesColumns } from "./customer-service-timelines-columns";
import { getCustomerServiceErrorText } from "./customer-service-utils";

const ALL_BRANCHES_VALUE = "__all_branches__";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

export function CustomerServiceTimelinesView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);
  const search = searchParams.get("search") || "";
  const branchId = searchParams.get("branchId") || "";

  const { findAllBranchesOptions } = useAllBranchesQuery();
  const { findCustomerServiceTimelines } = useCustomerServiceTimelinesQuery({
    page,
    limit,
    search,
    branchId: branchId || undefined,
  });

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = findCustomerServiceTimelines;

  const branches = useMemo(() => {
    const rows = findAllBranchesOptions.data ?? [];
    return [...rows].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [findAllBranchesOptions.data]);

  const hasSelectedBranchInOptions = useMemo(
    () => branches.some((branch) => branch.id === branchId),
    [branches, branchId],
  );

  const updateURL = useCallback(
    (next: { page: number; limit: number; search: string; branchId: string }) => {
      const params = new URLSearchParams();
      params.set("page", next.page.toString());
      params.set("limit", next.limit.toString());

      const trimmedSearch = next.search.trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (next.branchId) {
        params.set("branchId", next.branchId);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      updateURL({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
        branchId,
      });
    },
    [updateURL, search, branchId],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({
        page: 1,
        limit,
        search: value,
        branchId,
      });
    },
    [updateURL, limit, branchId],
  );

  const handleBranchChange = useCallback(
    (value: string) => {
      updateURL({
        page: 1,
        limit,
        search,
        branchId: value === ALL_BRANCHES_VALUE ? "" : value,
      });
    },
    [updateURL, limit, search],
  );

  const handleClearBranchFilter = useCallback(() => {
    updateURL({
      page: 1,
      limit,
      search,
      branchId: "",
    });
  }, [updateURL, limit, search]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">
          {getCustomerServiceErrorText(error, "No se pudo cargar los tiempos de atencion")}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/10 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full space-y-2 sm:max-w-sm">
            <Label htmlFor="timeline-branch-filter">Sucursal</Label>
            <Select
              value={branchId || ALL_BRANCHES_VALUE}
              onValueChange={handleBranchChange}
              disabled={findAllBranchesOptions.isLoading}
            >
              <SelectTrigger id="timeline-branch-filter" className="w-full">
                <SelectValue placeholder="Todas las sucursales" />
              </SelectTrigger>

              <SelectContent align="start">
                <SelectItem value={ALL_BRANCHES_VALUE}>Todas las sucursales</SelectItem>
                {branchId && !hasSelectedBranchInOptions ? (
                  <SelectItem value={branchId}>{`Sucursal (${branchId})`}</SelectItem>
                ) : null}
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {branchId ? (
            <Button variant="outline" onClick={handleClearBranchFilter}>
              Limpiar filtro
            </Button>
          ) : null}
        </div>

        {findAllBranchesOptions.error ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <p>
              {getCustomerServiceErrorText(
                findAllBranchesOptions.error,
                "No se pudo cargar sucursales",
              )}
            </p>
            <Button variant="outline" size="sm" onClick={() => findAllBranchesOptions.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : null}
      </div>

      <DataTable
        columns={customerServiceTimelinesColumns()}
        data={response?.data ?? []}
        loading={isLoading}
        pageCount={response?.meta?.totalPages ?? 0}
        pageIndex={page - 1}
        pageSize={limit}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        searchValue={search}
        searchPlaceholder="Buscar ticket, paquete, servicio o operador..."
        searchDebounceMs={300}
        totalItems={response?.meta?.total ?? 0}
      />
    </div>
  );
}
