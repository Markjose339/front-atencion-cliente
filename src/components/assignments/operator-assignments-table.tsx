"use client";

import { useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { useOperatorAssignmentsQuery } from "@/hooks/use-assignments";

import { operatorAssignmentColumns } from "./operator-assignment-columns";

const getErrorText = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "Error desconocido";
  }

  const current = error as Record<string, unknown>;

  if (typeof current.message === "string") {
    return current.message;
  }

  if (current.message && typeof current.message === "object") {
    const nested = current.message as Record<string, unknown>;

    if (typeof nested.message === "string") {
      return nested.message;
    }

    if (typeof nested.error === "string") {
      return nested.error;
    }
  }

  return "Error desconocido";
};

export function OperatorAssignmentsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("opPage") || 1);
  const limit = Number(searchParams.get("opLimit") || 10);
  const search = searchParams.get("opSearch") || "";

  const { findAllOperators } = useOperatorAssignmentsQuery({ page, limit, search });
  const { data: response, isLoading, error, refetch } = findAllOperators;

  const updateURL = useCallback(
    (next: { page: number; limit: number; search: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("opPage", next.page.toString());
      params.set("opLimit", next.limit.toString());

      if (next.search) {
        params.set("opSearch", next.search);
      } else {
        params.delete("opSearch");
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      updateURL({ page: pagination.pageIndex + 1, limit: pagination.pageSize, search });
    },
    [updateURL, search],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({ page: 1, limit, search: value });
    },
    [updateURL, limit],
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-red-500 space-y-4">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">Ocurrio un error: {getErrorText(error)}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={operatorAssignmentColumns()}
      data={response?.data ?? []}
      loading={isLoading}
      pageCount={response?.meta?.totalPages ?? 0}
      pageIndex={page - 1}
      pageSize={limit}
      onPaginationChange={handlePaginationChange}
      onSearchChange={handleSearchChange}
      searchValue={search}
      searchPlaceholder="Buscar asignaciones de operador..."
      totalItems={response?.meta?.total ?? 0}
    />
  );
}
