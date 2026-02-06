"use client";

import { DataTable } from "@/components/table/data-table";
import { permissionColumns } from "@/components/permissions/permission-columns";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { usePermissionsQuery } from "@/hooks/use-permissions";

export function PermissionsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page: number = Number(searchParams.get("page") || 1);
  const limit: number = Number(searchParams.get("limit") || 10);
  const search: string = searchParams.get("search") || "";
  const { findAllPermissions } = usePermissionsQuery({ page, limit, search });

  const { data: response, isLoading, error, refetch } = findAllPermissions;

  const updateURL = useCallback(
    (newPage: number, newLimit: number, newSearch: string): void => {
      const params = new URLSearchParams();
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());
      if (newSearch) params.set("search", newSearch);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }): void => {
      updateURL(pagination.pageIndex + 1, pagination.pageSize, search);
    },
    [updateURL, search]
  );

  const handleSearchChange = useCallback(
    (value: string): void => {
      updateURL(1, limit, value);
    },
    [updateURL, limit]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-red-500 space-y-4">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">
          Ocurrió un error: {(error as { message: string })?.message ?? "Error desconocido"}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={permissionColumns()}
      data={response?.data ?? []}
      loading={isLoading}
      pageCount={response?.meta?.totalPages ?? 0}
      pageIndex={page - 1}
      pageSize={limit}
      onPaginationChange={handlePaginationChange}
      onSearchChange={handleSearchChange}
      searchValue={search}
      searchPlaceholder="Buscar permisos..."
      totalItems={response?.meta?.total ?? 0}
    />
  );
}
