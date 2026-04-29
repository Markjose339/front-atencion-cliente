import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import {
  AuditCatalogResponse,
  AuditListQuery,
  AuditListResponse,
  AuditLogItem,
  AuditLogUser,
} from "@/types/audit";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/La_Paz",
});

const normalizeQueryValue = (value: string | undefined): string => (value ?? "").trim();

const appendQueryParam = (params: URLSearchParams, key: string, value: string | undefined) => {
  const normalizedValue = normalizeQueryValue(value);
  if (normalizedValue) {
    params.set(key, normalizedValue);
  }
};

const buildAuditListParams = (params: AuditListQuery): URLSearchParams => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  appendQueryParam(searchParams, "search", params.search);
  appendQueryParam(searchParams, "action", params.action);
  appendQueryParam(searchParams, "auditableType", params.auditableType);
  appendQueryParam(searchParams, "userId", params.userId);
  appendQueryParam(searchParams, "from", params.from);
  appendQueryParam(searchParams, "to", params.to);

  return searchParams;
};

const normalizeLabelPart = (value: string | null | undefined): string => value?.trim() ?? "";

export const humanizeAuditToken = (value: string): string =>
  value
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const formatAuditDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Fecha invalida";
  }

  return DATE_TIME_FORMATTER.format(date);
};

export const formatAuditUserLabel = (user: AuditLogUser | null | undefined): string => {
  if (!user) {
    return "Sistema";
  }

  const name = normalizeLabelPart(user.name);
  const email = normalizeLabelPart(user.email);

  if (name) {
    return name;
  }

  if (email) {
    return email;
  }

  return user.id;
};

export const formatAuditUserOptionLabel = (user: AuditLogUser): string => {
  const name = normalizeLabelPart(user.name);
  const email = normalizeLabelPart(user.email);

  if (name && email) {
    return `${name} (${email})`;
  }

  if (name) {
    return name;
  }

  if (email) {
    return email;
  }

  return user.id;
};

export function useAuditLogsQuery(params: AuditListQuery) {
  const findAuditLogs = useQuery({
    queryKey: [
      "audit",
      "list",
      params.page,
      params.limit,
      normalizeQueryValue(params.search),
      normalizeQueryValue(params.action),
      normalizeQueryValue(params.auditableType),
      normalizeQueryValue(params.userId),
      normalizeQueryValue(params.from),
      normalizeQueryValue(params.to),
    ],
    queryFn: async () => {
      const searchParams = buildAuditListParams(params);
      return api.get<AuditListResponse>(`/audit?${searchParams.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  return { findAuditLogs };
}

export function useAuditCatalogQuery() {
  const actionsQuery = useQuery({
    queryKey: ["audit", "catalog", "actions"],
    queryFn: async () => api.get<AuditCatalogResponse<string>>("/audit/catalog/actions"),
    staleTime: 5 * 60_000,
  });

  const auditableTypesQuery = useQuery({
    queryKey: ["audit", "catalog", "auditable-types"],
    queryFn: async () =>
      api.get<AuditCatalogResponse<string>>("/audit/catalog/auditable-types"),
    staleTime: 5 * 60_000,
  });

  const usersQuery = useQuery({
    queryKey: ["audit", "catalog", "users"],
    queryFn: async () => api.get<AuditCatalogResponse<AuditLogUser>>("/audit/catalog/users"),
    staleTime: 5 * 60_000,
  });

  return { actionsQuery, auditableTypesQuery, usersQuery };
}

export function useAuditLogDetailQuery(auditId: string | null, enabled: boolean = true) {
  const findAuditLogById = useQuery({
    queryKey: ["audit", "detail", auditId],
    queryFn: async () => api.get<AuditLogItem>(`/audit/${auditId}`),
    enabled: Boolean(auditId) && enabled,
    staleTime: 30_000,
  });

  return { findAuditLogById };
}
