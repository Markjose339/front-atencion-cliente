"use client";

import { useCallback, useMemo } from "react";

import { DashboardBlockState } from "@/components/dashboard/dashboard-block-state";
import { DashboardBranchTabs } from "@/components/dashboard/dashboard-branch-tabs";
import { DashboardBranchesRanking } from "@/components/dashboard/dashboard-branches-ranking";
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";
import { mapPanelToBranchTabs, useDashboardPanelQuery } from "@/hooks/use-dashboard";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";

const getQueryErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export function DashboardPageClient() {
  const panelQuery = useDashboardPanelQuery();
  const panel = panelQuery.data;

  const branchTabs = useMemo(() => mapPanelToBranchTabs(panel), [panel]);
  const retryLoad = useCallback(() => {
    void panelQuery.refetch();
  }, [panelQuery]);

  useDashboardRealtime({
    onInvalidate: retryLoad,
    debounceMs: 400,
    enabled: true,
  });

  if (panelQuery.isLoading && !panel) {
    return (
      <div className="mx-auto w-full max-w-375 space-y-4">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard Operativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Estado global y rendimiento por sucursal.
          </p>
        </section>
        <DashboardBlockState mode="loading" message="Cargando dashboard..." />
      </div>
    );
  }

  if (!panel && panelQuery.error) {
    return (
      <div className="mx-auto w-full max-w-375 space-y-4">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard Operativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Estado global y rendimiento por sucursal.
          </p>
        </section>
        <DashboardBlockState
          mode="error"
          message={getQueryErrorMessage(
            panelQuery.error,
            "No se pudo cargar el dashboard.",
          )}
          onRetry={retryLoad}
        />
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="mx-auto w-full max-w-375 space-y-4">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard Operativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Estado global y rendimiento por sucursal.
          </p>
        </section>
        <DashboardBlockState mode="empty" message="No hay datos para mostrar." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-375 space-y-5">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Dashboard Operativo
        </h1>
        <p className="text-sm text-muted-foreground">
          Estado global y rendimiento por sucursal.
        </p>
      </section>

      <DashboardKpiCards
        data={panel.summary.kpis}
        isLoading={panelQuery.isLoading}
        isFetching={panelQuery.isFetching}
        errorMessage={undefined}
        onRetry={retryLoad}
      />

      <DashboardBranchTabs
        data={branchTabs}
        isLoading={panelQuery.isLoading}
        isFetching={panelQuery.isFetching}
        errorMessage={
          panelQuery.error
            ? getQueryErrorMessage(
                panelQuery.error,
                "No se pudo cargar el rendimiento por sucursal.",
              )
            : undefined
        }
        onRetry={retryLoad}
      />

      <DashboardBranchesRanking
        data={panel.branches.data}
        isLoading={panelQuery.isLoading}
        isFetching={panelQuery.isFetching}
        errorMessage={
          panelQuery.error
            ? getQueryErrorMessage(
                panelQuery.error,
                "No se pudo cargar el ranking.",
              )
            : undefined
        }
        onRetry={retryLoad}
      />
    </div>
  );
}
