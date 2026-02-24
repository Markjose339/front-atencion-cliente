"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { DashboardBlockState } from "@/components/dashboard/dashboard-block-state";
import {
  formatInteger,
  formatPercent,
} from "@/components/dashboard/dashboard-formatters";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardBranchPerformanceItem } from "@/types/dashboard";

type DashboardBranchesRankingProps = {
  data: DashboardBranchPerformanceItem[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

const rankingChartConfig = {
  ticketsAttended: {
    label: "Atendidos",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function DashboardBranchesRanking({
  data,
  isLoading,
  isFetching,
  errorMessage,
  onRetry,
}: DashboardBranchesRankingProps) {
  const rows = [...data].sort(
    (left, right) => right.ticketsAttended - left.ticketsAttended,
  );

  if (isLoading && rows.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="loading" message="Cargando ranking..." />
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && errorMessage && rows.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="error" message={errorMessage} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="empty" message="No hay sucursales para el ranking." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span>Ranking de sucursales</span>
          {isFetching ? (
            <span className="text-xs font-normal text-muted-foreground">Actualizando...</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={rankingChartConfig}
          className="aspect-auto h-[360px] w-full"
        >
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 10, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatInteger} />
            <YAxis
              type="category"
              dataKey="branchName"
              width={140}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, _name, item) => {
                    const row = item.payload as DashboardBranchPerformanceItem;
                    return (
                      <div className="grid gap-1">
                        <span className="font-mono">
                          Atendidos: {formatInteger(Number(value))}
                        </span>
                        <span className="text-muted-foreground">
                          Finalizacion: {formatPercent(row.completionRatePct)}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="ticketsAttended"
              fill="var(--color-ticketsAttended)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
