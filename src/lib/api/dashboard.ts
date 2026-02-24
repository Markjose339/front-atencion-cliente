import {
  DashboardAreaBranchGroup,
  DashboardAreaSeriesPoint,
  DashboardBranchPerformanceItem,
  DashboardPanelData,
  DashboardServicePerformanceItem,
  DashboardServicesBranchGroup,
  DashboardSummaryKpis,
  DashboardWindowPerformanceItem,
  DashboardWindowsBranchGroup,
} from "@/types/dashboard";
import { api } from "@/lib/api";

type UnknownRecord = Record<string, unknown>;

const DASHBOARD_ENDPOINTS = {
  panel: "/dashboard/panel",
  summary: "/dashboard/summary",
  ticketsArea: "/dashboard/tickets-area",
  branches: "/dashboard/branches-performance",
  windows: "/dashboard/windows-performance",
  services: "/dashboard/services-performance",
} as const;

const EMPTY_SUMMARY: DashboardSummaryKpis = {
  ticketsCreated: 0,
  ticketsAttended: 0,
  ticketsCancelled: 0,
  queueNow: 0,
  attendingNow: 0,
  completionRatePct: 0,
  cancellationRatePct: 0,
  averageWaitMinutes: 0,
  averageAttentionMinutes: 0,
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord | null =>
  isRecord(value) ? value : null;

const isNotNull = <T>(value: T | null): value is T => value !== null;

const toNumberSafe = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const toStringSafe = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}`;
  }

  return fallback;
};

const unwrapPayload = (payload: unknown): unknown => {
  let current = payload;

  for (let i = 0; i < 3; i += 1) {
    if (!isRecord(current)) {
      break;
    }

    if (!("data" in current)) {
      break;
    }

    const next = current.data;
    if (!isRecord(next) && !Array.isArray(next)) {
      break;
    }

    current = next;
  }

  return current;
};

const pickArray = (payload: unknown, keys: string[]): unknown[] => {
  const root = unwrapPayload(payload);

  if (Array.isArray(root)) {
    return root;
  }

  if (!isRecord(root)) {
    return [];
  }

  for (const key of keys) {
    const direct = root[key];

    if (Array.isArray(direct)) {
      return direct;
    }

    if (isRecord(direct) && Array.isArray(direct.data)) {
      return direct.data;
    }
  }

  return [];
};

const normalizeDate = (value: unknown, fallback: string): string => {
  const date = toStringSafe(value, fallback);
  return date || fallback;
};

const normalizeSummaryKpis = (payload: unknown): DashboardSummaryKpis => {
  const root = asRecord(unwrapPayload(payload));
  const kpis = asRecord(root?.kpis ?? root?.summary ?? root?.metrics ?? root);

  if (!kpis) {
    return EMPTY_SUMMARY;
  }

  return {
    ticketsCreated: toNumberSafe(kpis.ticketsCreated),
    ticketsAttended: toNumberSafe(kpis.ticketsAttended),
    ticketsCancelled: toNumberSafe(kpis.ticketsCancelled),
    queueNow: toNumberSafe(kpis.queueNow),
    attendingNow: toNumberSafe(kpis.attendingNow),
    completionRatePct: toNumberSafe(kpis.completionRatePct),
    cancellationRatePct: toNumberSafe(kpis.cancellationRatePct),
    averageWaitMinutes: toNumberSafe(kpis.averageWaitMinutes),
    averageAttentionMinutes: toNumberSafe(kpis.averageAttentionMinutes),
  };
};

const normalizeAreaSeries = (payload: unknown): DashboardAreaSeriesPoint[] => {
  const rows = Array.isArray(payload) ? payload : [];

  return rows
    .map((row, index) => {
      if (!isRecord(row)) {
        return null;
      }

      return {
        date: normalizeDate(row.date ?? row.day, `point-${index + 1}`),
        created: toNumberSafe(row.created ?? row.ticketsCreated),
        attended: toNumberSafe(row.attended ?? row.ticketsAttended),
        cancelled: toNumberSafe(row.cancelled ?? row.ticketsCancelled),
        completionRatePct: toNumberSafe(row.completionRatePct),
      } satisfies DashboardAreaSeriesPoint;
    })
    .filter(isNotNull)
    .sort((left, right) => left.date.localeCompare(right.date));
};

const normalizeBranchPerformance = (payload: unknown): DashboardBranchPerformanceItem[] => {
  const rows = pickArray(payload, ["data", "branches", "items"]);

  return rows
    .map((row, index) => {
      if (!isRecord(row)) {
        return null;
      }

      return {
        branchId: toStringSafe(row.branchId ?? row.id, `branch-${index + 1}`),
        branchName: toStringSafe(row.branchName ?? row.name, `Sucursal ${index + 1}`),
        ticketsCreated: toNumberSafe(row.ticketsCreated),
        ticketsAttended: toNumberSafe(row.ticketsAttended),
        ticketsCancelled: toNumberSafe(row.ticketsCancelled),
        queueNow: toNumberSafe(row.queueNow),
        averageWaitMinutes: toNumberSafe(row.averageWaitMinutes),
        averageAttentionMinutes: toNumberSafe(row.averageAttentionMinutes),
        completionRatePct: toNumberSafe(row.completionRatePct),
        cancellationRatePct: toNumberSafe(row.cancellationRatePct),
      } satisfies DashboardBranchPerformanceItem;
    })
    .filter(isNotNull);
};

const normalizeWindows = (payload: unknown): DashboardWindowsBranchGroup[] => {
  const rows = pickArray(payload, ["data", "branches", "items"]);

  return rows
    .map((row, branchIndex) => {
      if (!isRecord(row)) {
        return null;
      }

      const windowsPayload = Array.isArray(row.windows)
        ? row.windows
        : Array.isArray(row.data)
          ? row.data
          : [];

      const windows = windowsPayload
        .map((windowRow, windowIndex) => {
          if (!isRecord(windowRow)) {
            return null;
          }

          return {
            windowId: toStringSafe(windowRow.windowId ?? windowRow.id, `window-${windowIndex + 1}`),
            windowName: toStringSafe(
              windowRow.windowName ?? windowRow.name ?? windowRow.windowCode,
              `Ventanilla ${windowIndex + 1}`,
            ),
            windowCode: toStringSafe(windowRow.windowCode, ""),
            ticketsAttended: toNumberSafe(windowRow.ticketsAttended),
            averageWaitMinutes: toNumberSafe(windowRow.averageWaitMinutes),
            averageAttentionMinutes: toNumberSafe(windowRow.averageAttentionMinutes),
          } satisfies DashboardWindowPerformanceItem;
        })
        .filter(isNotNull)
        .sort((left, right) => right.ticketsAttended - left.ticketsAttended);

      return {
        branchId: toStringSafe(row.branchId ?? row.id, `branch-${branchIndex + 1}`),
        branchName: toStringSafe(row.branchName ?? row.name, `Sucursal ${branchIndex + 1}`),
        totalAttended: toNumberSafe(row.totalAttended),
        windows,
      } satisfies DashboardWindowsBranchGroup;
    })
    .filter(isNotNull);
};

const normalizeServices = (payload: unknown): DashboardServicesBranchGroup[] => {
  const rows = pickArray(payload, ["data", "branches", "items"]);

  return rows
    .map((row, branchIndex) => {
      if (!isRecord(row)) {
        return null;
      }

      const servicesPayload = Array.isArray(row.services)
        ? row.services
        : Array.isArray(row.data)
          ? row.data
          : [];

      const services = servicesPayload
        .map((serviceRow, serviceIndex) => {
          if (!isRecord(serviceRow)) {
            return null;
          }

          return {
            serviceId: toStringSafe(
              serviceRow.serviceId ?? serviceRow.id,
              `service-${serviceIndex + 1}`,
            ),
            serviceName: toStringSafe(
              serviceRow.serviceName ?? serviceRow.name,
              `Servicio ${serviceIndex + 1}`,
            ),
            serviceCode: toStringSafe(serviceRow.serviceCode, ""),
            ticketsAttended: toNumberSafe(serviceRow.ticketsAttended),
            attendanceSharePct: toNumberSafe(serviceRow.attendanceSharePct),
            averageWaitMinutes: toNumberSafe(serviceRow.averageWaitMinutes),
            averageAttentionMinutes: toNumberSafe(serviceRow.averageAttentionMinutes),
          } satisfies DashboardServicePerformanceItem;
        })
        .filter(isNotNull)
        .sort((left, right) => right.ticketsAttended - left.ticketsAttended);

      return {
        branchId: toStringSafe(row.branchId ?? row.id, `branch-${branchIndex + 1}`),
        branchName: toStringSafe(row.branchName ?? row.name, `Sucursal ${branchIndex + 1}`),
        totalAttended: toNumberSafe(row.totalAttended),
        services,
      } satisfies DashboardServicesBranchGroup;
    })
    .filter(isNotNull);
};

const normalizeArea = (payload: unknown): DashboardAreaBranchGroup[] => {
  const rows = pickArray(payload, ["data", "branches", "items"]);

  if (rows.length > 0) {
    const first = rows[0];

    if (isRecord(first) && Array.isArray(first.data)) {
      return rows
        .map((row, index) => {
          if (!isRecord(row)) {
            return null;
          }

          return {
            branchId: toStringSafe(row.branchId ?? row.id, `branch-${index + 1}`),
            branchName: toStringSafe(row.branchName ?? row.name, `Sucursal ${index + 1}`),
            data: normalizeAreaSeries(row.data),
          } satisfies DashboardAreaBranchGroup;
        })
        .filter(isNotNull);
    }

    if (isRecord(first) && ("branchId" in first || "branchName" in first) && ("date" in first || "day" in first)) {
      const grouped = new Map<string, DashboardAreaBranchGroup>();

      for (const row of rows) {
        if (!isRecord(row)) {
          continue;
        }

        const branchId = toStringSafe(row.branchId ?? row.id, "branch-default");
        const branchName = toStringSafe(row.branchName ?? row.name, "Sucursal");

        const group = grouped.get(branchId) ?? {
          branchId,
          branchName,
          data: [],
        };

        group.data.push({
          date: normalizeDate(row.date ?? row.day, `point-${group.data.length + 1}`),
          created: toNumberSafe(row.created ?? row.ticketsCreated),
          attended: toNumberSafe(row.attended ?? row.ticketsAttended),
          cancelled: toNumberSafe(row.cancelled ?? row.ticketsCancelled),
          completionRatePct: toNumberSafe(row.completionRatePct),
        });

        grouped.set(branchId, group);
      }

      return [...grouped.values()].map((group) => ({
        ...group,
        data: group.data.sort((left, right) => left.date.localeCompare(right.date)),
      }));
    }

    if (isRecord(first) && ("date" in first || "day" in first)) {
      return [
        {
          branchId: "global",
          branchName: "General",
          data: normalizeAreaSeries(rows),
        },
      ];
    }
  }

  return [];
};

const createBranchNameMap = (
  branches: DashboardBranchPerformanceItem[],
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const branch of branches) {
    map.set(branch.branchId, branch.branchName);
  }
  return map;
};

const enrichGroupedNames = <T extends { branchId: string; branchName: string }>(
  groups: T[],
  branchNameMap: Map<string, string>,
): T[] =>
  groups.map((group) => ({
    ...group,
    branchName: group.branchName || branchNameMap.get(group.branchId) || group.branchId,
  }));

const normalizePanel = (payload: unknown): DashboardPanelData => {
  const root = asRecord(unwrapPayload(payload)) ?? {};

  const branches = normalizeBranchPerformance(root.branches ?? []);
  const branchNameMap = createBranchNameMap(branches);

  const area = enrichGroupedNames(normalizeArea(root.area ?? []), branchNameMap);
  const windows = enrichGroupedNames(normalizeWindows(root.windows ?? []), branchNameMap);
  const services = enrichGroupedNames(normalizeServices(root.services ?? []), branchNameMap);

  return {
    summary: {
      kpis: normalizeSummaryKpis(root.summary ?? {}),
    },
    area: {
      data: area,
    },
    branches: {
      data: branches,
    },
    windows: {
      data: windows,
    },
    services: {
      data: services,
    },
  };
};

const requestDashboard = (path: string): Promise<unknown> =>
  api.get<unknown>(path, { cache: "no-store" });

export const dashboardApi = {
  async getPanel(): Promise<DashboardPanelData> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.panel);
    return normalizePanel(payload);
  },
  async getSummary(): Promise<DashboardSummaryKpis> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.summary);
    return normalizeSummaryKpis(payload);
  },
  async getTicketsArea(): Promise<DashboardAreaBranchGroup[]> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.ticketsArea);
    return normalizeArea(payload);
  },
  async getBranchesPerformance(): Promise<DashboardBranchPerformanceItem[]> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.branches);
    return normalizeBranchPerformance(payload);
  },
  async getWindowsPerformance(): Promise<DashboardWindowsBranchGroup[]> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.windows);
    return normalizeWindows(payload);
  },
  async getServicesPerformance(): Promise<DashboardServicesBranchGroup[]> {
    const payload = await requestDashboard(DASHBOARD_ENDPOINTS.services);
    return normalizeServices(payload);
  },
};
