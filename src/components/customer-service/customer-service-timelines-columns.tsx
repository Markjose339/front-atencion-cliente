"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  CustomerServiceTicketType,
  CustomerServiceTimelineDuration,
  CustomerServiceTimelineTicket,
} from "@/types/customer-service";

import { CustomerServiceStatusBadge } from "./customer-service-status-badge";
import { formatCustomerServiceDate } from "./customer-service-utils";

const TICKET_TYPE_LABELS: Record<CustomerServiceTicketType, string> = {
  REGULAR: "Regular",
  PREFERENCIAL: "Preferencial",
};

const TICKET_TYPE_VARIANTS: Record<
  CustomerServiceTicketType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  REGULAR: "outline",
  PREFERENCIAL: "secondary",
};

const getDurationInSeconds = (
  duration: CustomerServiceTimelineDuration | null,
): number | null => {
  if (!duration) {
    return null;
  }

  const rawSeconds = Number.isFinite(duration.milliseconds)
    ? Math.round(duration.milliseconds / 1000)
    : Number.isFinite(duration.seconds)
      ? Math.round(duration.seconds)
      : Number.isFinite(duration.minutes)
        ? Math.round(duration.minutes * 60)
        : null;

  if (rawSeconds === null) {
    return null;
  }

  return Math.max(0, rawSeconds);
};

const formatTimelineDuration = (
  duration: CustomerServiceTimelineDuration | null,
): string => {
  const totalSeconds = getDurationInSeconds(duration);

  if (totalSeconds === null) {
    return "-";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

type DurationTone = "success" | "warning" | "danger";

const DURATION_TONE_STYLES: Record<DurationTone, string> = {
  success:
    "border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-600/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger:
    "border-red-600/30 bg-red-500/15 text-red-700 dark:text-red-300",
};

const getDurationTone = (
  duration: CustomerServiceTimelineDuration | null,
  thresholds: { greenMaxSeconds: number; yellowMaxSeconds: number },
): DurationTone | null => {
  const totalSeconds = getDurationInSeconds(duration);

  if (totalSeconds === null) {
    return null;
  }

  if (totalSeconds <= thresholds.greenMaxSeconds) {
    return "success";
  }

  if (totalSeconds <= thresholds.yellowMaxSeconds) {
    return "warning";
  }

  return "danger";
};

const renderDurationBadge = (
  duration: CustomerServiceTimelineDuration | null,
  thresholds: { greenMaxSeconds: number; yellowMaxSeconds: number },
) => {
  const label = formatTimelineDuration(duration);
  if (label === "-") {
    return label;
  }

  const tone = getDurationTone(duration, thresholds);
  if (!tone) {
    return label;
  }

  return (
    <Badge variant="outline" className={DURATION_TONE_STYLES[tone]}>
      {label}
    </Badge>
  );
};

export const customerServiceTimelinesColumns =
  (): ColumnDef<CustomerServiceTimelineTicket>[] => [
    {
      accessorKey: "code",
      header: "Ticket",
    },
    {
      accessorKey: "packageCode",
      header: "Paquete",
      cell: ({ row }) => row.original.packageCode || "-",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={TICKET_TYPE_VARIANTS[row.original.type]}>
          {TICKET_TYPE_LABELS[row.original.type]}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <CustomerServiceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "branchName",
      header: "Sucursal",
    },
    {
      accessorKey: "serviceName",
      header: "Servicio",
    },
    {
      accessorKey: "userName",
      header: "Operador",
      cell: ({ row }) => row.original.userName || "-",
    },
    {
      accessorKey: "calledAt",
      header: "Llamado",
      cell: ({ row }) => formatCustomerServiceDate(row.original.calledAt),
    },
    {
      accessorKey: "attentionStartedAt",
      header: "Inicio atencion",
      cell: ({ row }) => formatCustomerServiceDate(row.original.attentionStartedAt),
    },
    {
      accessorKey: "attentionFinishedAt",
      header: "Fin atencion",
      cell: ({ row }) => formatCustomerServiceDate(row.original.attentionFinishedAt),
    },
    {
      accessorKey: "fromCreatedToAttention",
      header: "Creado -> atencion",
      cell: ({ row }) =>
        renderDurationBadge(row.original.fromCreatedToAttention, {
          greenMaxSeconds: 150,
          yellowMaxSeconds: 300,
        }),
    },
    {
      accessorKey: "fromAttentionStartToFinish",
      header: "Atencion -> fin",
      cell: ({ row }) =>
        renderDurationBadge(row.original.fromAttentionStartToFinish, {
          greenMaxSeconds: 300,
          yellowMaxSeconds: 600,
        }),
    },
    {
      accessorKey: "createdAt",
      header: "Creado",
      cell: ({ row }) => formatCustomerServiceDate(row.original.createdAt),
    },
  ];
