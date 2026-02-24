export interface DashboardSummaryKpis {
  ticketsCreated: number;
  ticketsAttended: number;
  ticketsCancelled: number;
  queueNow: number;
  attendingNow: number;
  completionRatePct: number;
  cancellationRatePct: number;
  averageWaitMinutes: number;
  averageAttentionMinutes: number;
}

export interface DashboardAreaSeriesPoint {
  date: string;
  created: number;
  attended: number;
  cancelled: number;
  completionRatePct: number;
}

export interface DashboardAreaBranchGroup {
  branchId: string;
  branchName: string;
  data: DashboardAreaSeriesPoint[];
}

export interface DashboardBranchPerformanceItem {
  branchId: string;
  branchName: string;
  ticketsCreated: number;
  ticketsAttended: number;
  ticketsCancelled: number;
  queueNow: number;
  averageWaitMinutes: number;
  averageAttentionMinutes: number;
  completionRatePct: number;
  cancellationRatePct: number;
}

export interface DashboardWindowPerformanceItem {
  windowId: string;
  windowName: string;
  windowCode?: string;
  ticketsAttended: number;
  averageWaitMinutes: number;
  averageAttentionMinutes: number;
}

export interface DashboardWindowsBranchGroup {
  branchId: string;
  branchName: string;
  totalAttended: number;
  windows: DashboardWindowPerformanceItem[];
}

export interface DashboardServicePerformanceItem {
  serviceId: string;
  serviceName: string;
  serviceCode?: string;
  ticketsAttended: number;
  attendanceSharePct: number;
  averageWaitMinutes: number;
  averageAttentionMinutes: number;
}

export interface DashboardServicesBranchGroup {
  branchId: string;
  branchName: string;
  totalAttended: number;
  services: DashboardServicePerformanceItem[];
}

export interface DashboardPanelData {
  summary: {
    kpis: DashboardSummaryKpis;
  };
  area: {
    data: DashboardAreaBranchGroup[];
  };
  branches: {
    data: DashboardBranchPerformanceItem[];
  };
  windows: {
    data: DashboardWindowsBranchGroup[];
  };
  services: {
    data: DashboardServicesBranchGroup[];
  };
}

export interface DashboardBranchTabData {
  branchId: string;
  branchName: string;
  area: DashboardAreaSeriesPoint[];
  windows: DashboardWindowPerformanceItem[];
  services: DashboardServicePerformanceItem[];
}

export interface DashboardInvalidatePayload {
  event: string;
  branchId: string;
  serviceId?: string;
  ticketId?: string;
  at: string;
}
