"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  formatInteger,
  formatMinutes,
} from "@/components/dashboard/dashboard-formatters";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardWindowPerformanceItem } from "@/types/dashboard";

type DashboardBranchWindowsChartProps = {
  data: DashboardWindowPerformanceItem[];
};

const windowsChartConfig = {
  ticketsAttended: {
    label: "Atendidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DashboardBranchWindowsChart({
  data,
}: DashboardBranchWindowsChartProps) {
  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Ventanillas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={windowsChartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 14, top: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatInteger} />
            <YAxis
              type="category"
              dataKey="windowName"
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, _name, item) => {
                    const row = item.payload as DashboardWindowPerformanceItem;

                    return (
                      <div className="grid gap-1">
                        <span className="font-mono">
                          Atendidos: {formatInteger(Number(value))}
                        </span>
                        <span className="text-muted-foreground">
                          Espera: {formatMinutes(row.averageWaitMinutes)}
                        </span>
                        <span className="text-muted-foreground">
                          Atencion: {formatMinutes(row.averageAttentionMinutes)}
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
