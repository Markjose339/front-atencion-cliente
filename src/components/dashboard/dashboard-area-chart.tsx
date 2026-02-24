"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  formatCompactDate,
  formatInteger,
} from "@/components/dashboard/dashboard-formatters";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardAreaSeriesPoint } from "@/types/dashboard";

type DashboardAreaChartProps = {
  title?: string;
  data: DashboardAreaSeriesPoint[];
};

const areaConfig = {
  created: {
    label: "Creados",
    color: "var(--chart-2)",
  },
  attended: {
    label: "Atendidos",
    color: "var(--chart-3)",
  },
  cancelled: {
    label: "Cancelados",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function DashboardAreaChart({
  title = "Tickets por dia",
  data,
}: DashboardAreaChartProps) {
  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={areaConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 2 }}>
            <defs>
              <linearGradient id="areaCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="areaAttended" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-attended)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-attended)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="areaCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cancelled)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-cancelled)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={formatCompactDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={formatInteger}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString("es-BO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  }
                  formatter={(value) => formatInteger(Number(value))}
                />
              }
            />
            <Area
              dataKey="created"
              type="monotone"
              stroke="var(--color-created)"
              fill="url(#areaCreated)"
              strokeWidth={2}
            />
            <Area
              dataKey="attended"
              type="monotone"
              stroke="var(--color-attended)"
              fill="url(#areaAttended)"
              strokeWidth={2}
            />
            <Area
              dataKey="cancelled"
              type="monotone"
              stroke="var(--color-cancelled)"
              fill="url(#areaCancelled)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
