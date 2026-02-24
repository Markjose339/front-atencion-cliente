import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/lib/api/dashboard";
import {
  DashboardBranchPerformanceItem,
  DashboardBranchTabData,
  DashboardPanelData,
} from "@/types/dashboard";

const sortByDate = <T extends { date: string }>(rows: T[]): T[] =>
  [...rows].sort((left, right) => left.date.localeCompare(right.date));

const sortByTicketsDesc = <T extends { ticketsAttended: number }>(rows: T[]): T[] =>
  [...rows].sort((left, right) => right.ticketsAttended - left.ticketsAttended);

const sortedBranches = (
  branches: DashboardBranchPerformanceItem[],
): DashboardBranchPerformanceItem[] =>
  [...branches].sort((left, right) =>
    left.branchName.localeCompare(right.branchName, "es"),
  );

export const mapPanelToBranchTabs = (
  panel: DashboardPanelData | undefined,
): DashboardBranchTabData[] => {
  if (!panel) {
    return [];
  }

  const branchMap = new Map<string, DashboardBranchTabData>();

  for (const branch of sortedBranches(panel.branches.data)) {
    branchMap.set(branch.branchId, {
      branchId: branch.branchId,
      branchName: branch.branchName,
      area: [],
      windows: [],
      services: [],
    });
  }

  for (const group of panel.area.data) {
    const current = branchMap.get(group.branchId) ?? {
      branchId: group.branchId,
      branchName: group.branchName,
      area: [],
      windows: [],
      services: [],
    };

    current.area = sortByDate(group.data);
    current.branchName = current.branchName || group.branchName;
    branchMap.set(group.branchId, current);
  }

  for (const group of panel.windows.data) {
    const current = branchMap.get(group.branchId) ?? {
      branchId: group.branchId,
      branchName: group.branchName,
      area: [],
      windows: [],
      services: [],
    };

    current.windows = sortByTicketsDesc(group.windows);
    current.branchName = current.branchName || group.branchName;
    branchMap.set(group.branchId, current);
  }

  for (const group of panel.services.data) {
    const current = branchMap.get(group.branchId) ?? {
      branchId: group.branchId,
      branchName: group.branchName,
      area: [],
      windows: [],
      services: [],
    };

    current.services = sortByTicketsDesc(group.services);
    current.branchName = current.branchName || group.branchName;
    branchMap.set(group.branchId, current);
  }

  return [...branchMap.values()].sort((left, right) =>
    left.branchName.localeCompare(right.branchName, "es"),
  );
};

export const useDashboardPanelQuery = () =>
  useQuery({
    queryKey: ["dashboard", "panel"],
    queryFn: () => dashboardApi.getPanel(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
