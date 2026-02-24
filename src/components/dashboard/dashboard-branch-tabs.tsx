"use client";

import { useMemo, useState } from "react";

import { DashboardAreaChart } from "@/components/dashboard/dashboard-area-chart";
import { DashboardBlockState } from "@/components/dashboard/dashboard-block-state";
import { DashboardBranchServicesDonut } from "@/components/dashboard/dashboard-branch-services-donut";
import { DashboardBranchWindowsChart } from "@/components/dashboard/dashboard-branch-windows-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardBranchTabData } from "@/types/dashboard";

type DashboardBranchTabsProps = {
  data: DashboardBranchTabData[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function DashboardBranchTabs({
  data,
  isLoading,
  isFetching,
  errorMessage,
  onRetry,
}: DashboardBranchTabsProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(data[0]?.branchId ?? "");

  const activeBranchId =
    data.some((branch) => branch.branchId === selectedBranchId)
      ? selectedBranchId
      : (data[0]?.branchId ?? "");

  const activeBranch = useMemo(
    () => data.find((branch) => branch.branchId === activeBranchId) ?? data[0],
    [activeBranchId, data],
  );

  if (isLoading && data.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="loading" message="Cargando rendimiento por sucursal..." />
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && errorMessage && data.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="error" message={errorMessage} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="empty" message="No hay sucursales con datos." />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="gap-3 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <span>Rendimiento por sucursal</span>
            {isFetching ? (
              <span className="text-xs font-normal text-muted-foreground">Actualizando...</span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div role="tablist" aria-label="Sucursales" className="flex flex-wrap gap-2">
            {data.map((branch) => {
              const isActive = branch.branchId === activeBranch?.branchId;

              return (
                <Button
                  key={branch.branchId}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn("max-w-full truncate", !isActive && "text-muted-foreground")}
                  onClick={() => setSelectedBranchId(branch.branchId)}
                >
                  {branch.branchName}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div role="tabpanel" aria-live="polite" className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">{activeBranch?.branchName}</p>

        {activeBranch && activeBranch.area.length > 0 ? (
          <DashboardAreaChart title="Tickets por dia" data={activeBranch.area} />
        ) : (
          <Card className="py-0">
            <CardContent>
              <DashboardBlockState
                mode="empty"
                message="No hay serie de tickets para esta sucursal."
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {activeBranch && activeBranch.windows.length > 0 ? (
            <DashboardBranchWindowsChart data={activeBranch.windows} />
          ) : (
            <Card className="py-0">
              <CardContent>
                <DashboardBlockState mode="empty" message="Sin datos de ventanillas." />
              </CardContent>
            </Card>
          )}

          {activeBranch && activeBranch.services.length > 0 ? (
            <DashboardBranchServicesDonut data={activeBranch.services} />
          ) : (
            <Card className="py-0">
              <CardContent>
                <DashboardBlockState mode="empty" message="Sin datos de servicios." />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
