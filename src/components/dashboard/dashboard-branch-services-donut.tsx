"use client";

import { Pie, PieChart } from "recharts";

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
import { DashboardServicePerformanceItem } from "@/types/dashboard";

type DashboardBranchServicesDonutProps = {
  data: DashboardServicePerformanceItem[];
};

const servicesChartConfig = {
  attendanceSharePct: {
    label: "Participacion",
  },
} satisfies ChartConfig;

const serviceColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DashboardBranchServicesDonut({
  data,
}: DashboardBranchServicesDonutProps) {
  const chartData = data.map((service, index) => ({
    ...service,
    fill: serviceColors[index % serviceColors.length],
  }));

  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Servicios</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <ChartContainer
          config={servicesChartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const row = item.payload as DashboardServicePerformanceItem;

                    return (
                      <div className="grid gap-1">
                        <span className="font-mono">
                          Participacion: {formatPercent(Number(value))}
                        </span>
                        <span className="text-muted-foreground">
                          Atendidos: {formatInteger(row.ticketsAttended)}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="attendanceSharePct"
              nameKey="serviceName"
              innerRadius={55}
              outerRadius={90}
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>

        <ul className="space-y-2 text-sm">
          {chartData.map((service) => (
            <li key={service.serviceId} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: service.fill }}
                />
                <span className="truncate">{service.serviceName}</span>
              </span>
              <span className="shrink-0 font-mono text-muted-foreground">
                {formatPercent(service.attendanceSharePct)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
