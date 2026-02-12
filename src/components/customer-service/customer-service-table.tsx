"use client";

import { DataTable } from "@/components/table/data-table";
import { CustomerServiceTicket } from "@/types/customer-service";

import { customerServiceColumns } from "./customer-service-columns";

interface CustomerServiceTableProps {
  data: CustomerServiceTicket[];
  loading: boolean;
  page: number;
  limit: number;
  search: string;
  pageCount: number;
  totalItems: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSearchChange: (value: string) => void;
}

export function CustomerServiceTable({
  data,
  loading,
  page,
  limit,
  search,
  pageCount,
  totalItems,
  onPaginationChange,
  onSearchChange,
}: CustomerServiceTableProps) {
  return (
    <section className="rounded-xl border bg-background shadow-sm">
      <div className="px-3 py-4 sm:px-5">
        <DataTable
          columns={customerServiceColumns()}
          data={data}
          loading={loading}
          pageCount={pageCount}
          pageIndex={page - 1}
          pageSize={limit}
          onPaginationChange={onPaginationChange}
          onSearchChange={onSearchChange}
          searchValue={search}
          searchPlaceholder="Buscar por ticket o paquete..."
          totalItems={totalItems}
        />
      </div>
    </section>
  );
}
