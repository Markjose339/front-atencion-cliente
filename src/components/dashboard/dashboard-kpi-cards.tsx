"use client";

import { DashboardBlockState } from "@/components/dashboard/dashboard-block-state";
import {
  formatInteger,
  formatMinutes,
  formatPercent,
} from "@/components/dashboard/dashboard-formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummaryKpis } from "@/types/dashboard";

type DashboardKpiCardsProps = {
  data?: DashboardSummaryKpis;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

type KpiCardItem = {
  title: string;
  value: string;
  helper?: string;
};

const kpiSkeletons = () => (
  <>
    {Array.from({ length: 8 }).map((_, index) => (
      <Card key={`kpi-skeleton-${index}`} className="gap-2 py-4">
        <CardHeader className="px-4 pb-0 md:px-5">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-2 px-4 md:px-5">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </>
);

export function DashboardKpiCards({
  data,
  isLoading,
  isFetching,
  errorMessage,
  onRetry,
}: DashboardKpiCardsProps) {
  if (isLoading && !data) {
    return <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{kpiSkeletons()}</section>;
  }

  if (!data && errorMessage) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="error" message={errorMessage} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="py-0">
        <CardContent>
          <DashboardBlockState mode="empty" message="No hay KPIs para mostrar." />
        </CardContent>
      </Card>
    );
  }

  const cards: KpiCardItem[] = [
    { title: "Tickets creados", value: formatInteger(data.ticketsCreated) },
    { title: "Tickets atendidos", value: formatInteger(data.ticketsAttended) },
    { title: "Tickets cancelados", value: formatInteger(data.ticketsCancelled) },
    { title: "En cola ahora", value: formatInteger(data.queueNow) },
    { title: "Atendiendo ahora", value: formatInteger(data.attendingNow) },
    {
      title: "Tiempo promedio de espera",
      value: formatMinutes(data.averageWaitMinutes),
    },
    {
      title: "Tiempo promedio de atencion",
      value: formatMinutes(data.averageAttentionMinutes),
    },
    {
      title: "Finalizacion / Cancelacion",
      value: `${formatPercent(data.completionRatePct)} / ${formatPercent(
        data.cancellationRatePct,
      )}`,
      helper: "Porcentaje sobre tickets creados",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="gap-2 py-4">
          <CardHeader className="px-4 pb-0 md:px-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 md:px-5">
            <p className="text-xl font-semibold md:text-2xl">{card.value}</p>
            <p className="min-h-4 text-xs text-muted-foreground">
              {isFetching ? "Actualizando..." : card.helper ?? ""}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
