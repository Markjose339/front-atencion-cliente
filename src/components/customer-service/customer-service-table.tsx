"use client";

import { DataTable } from "@/components/table/data-table";
import { AlertCircle, MonitorDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useCustomerServiceQuery } from "@/hooks/use-customer-service";
import { customerServiceColumns } from "./customer-service-columns";

export function CustomerServiceTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";

  const { findPendingTicketsByUserServiceWindow } =
    useCustomerServiceQuery({ page, limit, search });

  const { data: response, isLoading, error, refetch } =
    findPendingTicketsByUserServiceWindow;

  const updateURL = useCallback(
    (newPage: number, newLimit: number, newSearch: string) => {
      const params = new URLSearchParams();
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());
      if (newSearch) params.set("search", newSearch);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      updateURL(pagination.pageIndex + 1, pagination.pageSize, search);
    },
    [updateURL, search]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL(1, limit, value);
    },
    [updateURL, limit]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {(error as { message: string })?.message ??
            "Ocurrió un error inesperado"}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Atención al Cliente
        </h1>

        {response?.serviceWindowName && (
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            <MonitorDot className="mr-1 h-5 w-5" />
            {response.serviceWindowName}
          </Badge>
        )}
      </div>

      <Separator />

      {response?.isAttendingTicket && (
        <div className="flex items-center gap-4 rounded-xl border border-blue-800/30 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-900/20 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/30">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 dark:bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-300" />
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Estado de atención
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Se está atendiendo un ticket en este momento
            </span>
          </div>
        </div>
      )}

      <section className="rounded-xl border bg-background shadow-sm">
        <div className="px-3 py-4 sm:px-5">
          <DataTable
            columns={customerServiceColumns()}
            data={response?.data ?? []}
            loading={isLoading}
            pageCount={response?.meta?.totalPages ?? 0}
            pageIndex={page - 1}
            pageSize={limit}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchChange}
            searchValue={search}
            searchPlaceholder="Buscar tickets..."
            totalItems={response?.meta?.total ?? 0}
          />
        </div>
      </section>
    </div>
  );
}
