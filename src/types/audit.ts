export interface AuditLogUser {
  id: string;
  name: string | null;
  email: string | null;
}

export interface AuditLogItem {
  id: string;
  action: string;
  auditableType: string;
  auditableId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: AuditLogUser | null;
}

export interface AuditListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  from: number | string | null;
  to: number | string | null;
}

export interface AuditListResponse {
  data: AuditLogItem[];
  meta: AuditListMeta;
}

export interface AuditCatalogResponse<T> {
  data: T[];
}

export interface AuditListQuery {
  page: number;
  limit: number;
  search?: string;
  action?: string;
  auditableType?: string;
  userId?: string;
  from?: string;
  to?: string;
}
