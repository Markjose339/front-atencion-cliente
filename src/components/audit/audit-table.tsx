"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, FilterX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { auditColumns } from "@/components/audit/audit-columns";
import { AuditDetailSheet } from "@/components/audit/audit-detail-sheet";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatAuditUserOptionLabel,
  humanizeAuditToken,
  useAuditCatalogQuery,
  useAuditLogsQuery,
} from "@/hooks/use-audit";
import { extractApiErrorMessage } from "@/lib/api-error";
import { AuditLogUser } from "@/types/audit";

const ALL_ACTIONS_VALUE = "__all_actions__";
const ALL_TYPES_VALUE = "__all_types__";
const ALL_USERS_VALUE = "__all_users__";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

const normalizeDateInputValue = (value: string | null): string => {
  const normalized = value?.trim() ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
};

const sortStringList = (values: string[]): string[] =>
  [...values].sort((left, right) => left.localeCompare(right, "es"));

const sortUsers = (users: AuditLogUser[]): AuditLogUser[] =>
  [...users].sort((left, right) =>
    formatAuditUserOptionLabel(left).localeCompare(formatAuditUserOptionLabel(right), "es"),
  );

export function AuditTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "";
  const auditableType = searchParams.get("auditableType") || "";
  const userId = searchParams.get("userId") || "";
  const from = normalizeDateInputValue(searchParams.get("from"));
  const to = normalizeDateInputValue(searchParams.get("to"));

  const { findAuditLogs } = useAuditLogsQuery({
    page,
    limit,
    search,
    action,
    auditableType,
    userId,
    from,
    to,
  });
  const { actionsQuery, auditableTypesQuery, usersQuery } = useAuditCatalogQuery();

  const actions = useMemo(() => sortStringList(actionsQuery.data?.data ?? []), [actionsQuery.data]);
  const auditableTypes = useMemo(
    () => sortStringList(auditableTypesQuery.data?.data ?? []),
    [auditableTypesQuery.data],
  );
  const users = useMemo(() => sortUsers(usersQuery.data?.data ?? []), [usersQuery.data]);

  const hasSelectedAction = actions.includes(action);
  const hasSelectedAuditableType = auditableTypes.includes(auditableType);
  const hasSelectedUser = users.some((user) => user.id === userId);

  const hasAppliedFilters = Boolean(
    search.trim() || action || auditableType || userId || from || to,
  );

  const updateURL = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      action?: string;
      auditableType?: string;
      userId?: string;
      from?: string;
      to?: string;
    }) => {
      const next = {
        page,
        limit,
        search,
        action,
        auditableType,
        userId,
        from,
        to,
        ...updates,
      };

      const params = new URLSearchParams();
      params.set("page", String(next.page));
      params.set("limit", String(next.limit));

      const normalizedSearch = next.search.trim();
      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }

      if (next.action) {
        params.set("action", next.action);
      }

      if (next.auditableType) {
        params.set("auditableType", next.auditableType);
      }

      if (next.userId) {
        params.set("userId", next.userId);
      }

      if (next.from) {
        params.set("from", next.from);
      }

      if (next.to) {
        params.set("to", next.to);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, page, limit, search, action, auditableType, userId, from, to],
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

  const handleAuditDetailOpenChange = useCallback((openState: boolean) => {
    setDetailOpen(openState);

    if (!openState) {
      setSelectedAuditId(null);
    }
  }, []);

  const handleOpenDetail = useCallback((auditId: string) => {
    setSelectedAuditId(auditId);
    setDetailOpen(true);
  }, []);

  const reloadCatalogs = useCallback(() => {
    actionsQuery.refetch();
    auditableTypesQuery.refetch();
    usersQuery.refetch();
  }, [actionsQuery, auditableTypesQuery, usersQuery]);

  const catalogError =
    actionsQuery.error ?? auditableTypesQuery.error ?? usersQuery.error ?? null;

  if (findAuditLogs.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">
          {extractApiErrorMessage(findAuditLogs.error, "No se pudo cargar el listado de auditoria")}
        </p>
        <Button variant="outline" onClick={() => findAuditLogs.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-lg border bg-muted/10 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="audit-action-filter">Accion</Label>
              <Select
                value={action || ALL_ACTIONS_VALUE}
                onValueChange={(value) =>
                  updateURL({ page: 1, action: value === ALL_ACTIONS_VALUE ? "" : value })
                }
                disabled={actionsQuery.isLoading}
              >
                <SelectTrigger id="audit-action-filter" className="w-full bg-background">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value={ALL_ACTIONS_VALUE}>Todas las acciones</SelectItem>
                  {action && !hasSelectedAction ? (
                    <SelectItem value={action}>{humanizeAuditToken(action)}</SelectItem>
                  ) : null}
                  {actions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {humanizeAuditToken(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-type-filter">Entidad</Label>
              <Select
                value={auditableType || ALL_TYPES_VALUE}
                onValueChange={(value) =>
                  updateURL({
                    page: 1,
                    auditableType: value === ALL_TYPES_VALUE ? "" : value,
                  })
                }
                disabled={auditableTypesQuery.isLoading}
              >
                <SelectTrigger id="audit-type-filter" className="w-full bg-background">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value={ALL_TYPES_VALUE}>Todos los tipos</SelectItem>
                  {auditableType && !hasSelectedAuditableType ? (
                    <SelectItem value={auditableType}>
                      {humanizeAuditToken(auditableType)}
                    </SelectItem>
                  ) : null}
                  {auditableTypes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {humanizeAuditToken(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-user-filter">Usuario</Label>
              <Select
                value={userId || ALL_USERS_VALUE}
                onValueChange={(value) =>
                  updateURL({ page: 1, userId: value === ALL_USERS_VALUE ? "" : value })
                }
                disabled={usersQuery.isLoading}
              >
                <SelectTrigger id="audit-user-filter" className="w-full bg-background">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value={ALL_USERS_VALUE}>Todos los usuarios</SelectItem>
                  {userId && !hasSelectedUser ? <SelectItem value={userId}>{userId}</SelectItem> : null}
                  {users.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {formatAuditUserOptionLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-from-date">Desde</Label>
              <Input
                id="audit-from-date"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => updateURL({ page: 1, from: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-to-date">Hasta</Label>
              <Input
                id="audit-to-date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => updateURL({ page: 1, to: event.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!hasAppliedFilters}
                onClick={() =>
                  updateURL({
                    page: 1,
                    search: "",
                    action: "",
                    auditableType: "",
                    userId: "",
                    from: "",
                    to: "",
                  })
                }
              >
                <FilterX className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>

          {catalogError ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <p>
                {extractApiErrorMessage(catalogError, "No se pudieron cargar todos los catalogos")}
              </p>
              <Button variant="outline" size="sm" onClick={reloadCatalogs}>
                Reintentar
              </Button>
            </div>
          ) : null}
        </section>

        <DataTable
          columns={auditColumns()}
          data={findAuditLogs.data?.data ?? []}
          loading={findAuditLogs.isLoading}
          pageCount={findAuditLogs.data?.meta?.totalPages ?? 0}
          pageIndex={page - 1}
          pageSize={limit}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          searchValue={search}
          searchPlaceholder="Buscar en auditoria..."
          searchDebounceMs={400}
          totalItems={findAuditLogs.data?.meta?.total ?? 0}
          onRowClick={(row) => handleOpenDetail(row.id)}
        />
      </div>

      <AuditDetailSheet
        auditId={selectedAuditId}
        open={detailOpen}
        onOpenChange={handleAuditDetailOpenChange}
      />
    </>
  );
}
