import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  publicDisplayCalledTicketListSchema,
  publicDisplayCallsQuerySchema,
  publicDisplayConfigSchema,
  publicDisplaySocketTicketPayloadSchema,
} from "@/lib/schemas/public-display.schema";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { joinPublicQueue } from "@/lib/socket";
import { PublicDisplayCalledTicket, PublicDisplayConfig } from "@/types/public-display";

const PUBLIC_DISPLAY_CONFIG_KEY = "public_display_config_v1";
const PUBLIC_DISPLAY_CONFIG_EVENT = "public-display-config-change";

const normalizeServiceIds = (serviceIds: string[]): string[] =>
  Array.from(
    new Set(
      serviceIds
        .map((serviceId) => serviceId.trim())
        .filter((serviceId) => serviceId.length > 0),
    ),
  );

const sortByLatestCall = (tickets: PublicDisplayCalledTicket[]): PublicDisplayCalledTicket[] =>
  [...tickets].sort((a, b) => {
    const aDate = new Date(a.calledAt ?? a.createdAt).getTime();
    const bDate = new Date(b.calledAt ?? b.createdAt).getTime();
    return bDate - aDate;
  });

const compactTicketList = (
  tickets: PublicDisplayCalledTicket[],
  maxItems: number,
): PublicDisplayCalledTicket[] => sortByLatestCall(tickets).slice(0, maxItems);

const parseSocketTicketPayload = (payload: unknown): PublicDisplayCalledTicket | null => {
  const parsed = publicDisplaySocketTicketPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  if ("ticket" in parsed.data) {
    return parsed.data.ticket;
  }

  if ("data" in parsed.data) {
    return parsed.data.data;
  }

  return parsed.data;
};

const isTicketInScope = (
  ticket: PublicDisplayCalledTicket,
  branchId: string,
  serviceIds: string[],
): boolean => ticket.branchId === branchId && serviceIds.includes(ticket.serviceId);

const parseStoredConfig = (value: string): PublicDisplayConfig | null => {
  try {
    const parsedJson: unknown = JSON.parse(value);
    const parsedConfig = publicDisplayConfigSchema.safeParse(parsedJson);

    if (!parsedConfig.success) {
      return null;
    }

    return parsedConfig.data;
  } catch {
    return null;
  }
};

export function getPublicDisplayConfig(): PublicDisplayConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawConfig = window.localStorage.getItem(PUBLIC_DISPLAY_CONFIG_KEY);
  if (!rawConfig) {
    return null;
  }

  return parseStoredConfig(rawConfig);
}

const getPublicDisplayConfigSnapshot = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PUBLIC_DISPLAY_CONFIG_KEY);
};

export function setPublicDisplayConfig(config: PublicDisplayConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  const parsed = publicDisplayConfigSchema.parse(config);
  window.localStorage.setItem(PUBLIC_DISPLAY_CONFIG_KEY, JSON.stringify(parsed));
  window.dispatchEvent(new Event(PUBLIC_DISPLAY_CONFIG_EVENT));
}

export function clearPublicDisplayConfig(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PUBLIC_DISPLAY_CONFIG_KEY);
  window.dispatchEvent(new Event(PUBLIC_DISPLAY_CONFIG_EVENT));
}

type UsePublicDisplayConfigReturn = {
  config: PublicDisplayConfig | null;
  isConfigReady: boolean;
  saveConfig: (config: PublicDisplayConfig) => void;
  clearConfig: () => void;
};

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const useIsClient = (): boolean =>
  useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

const subscribePublicDisplayConfig = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) {
      return;
    }

    if (event.key && event.key !== PUBLIC_DISPLAY_CONFIG_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PUBLIC_DISPLAY_CONFIG_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PUBLIC_DISPLAY_CONFIG_EVENT, onStoreChange);
  };
};

export function usePublicDisplayConfig(): UsePublicDisplayConfigReturn {
  const isConfigReady = useIsClient();
  const rawConfig = useSyncExternalStore(
    subscribePublicDisplayConfig,
    getPublicDisplayConfigSnapshot,
    () => null,
  );
  const config = useMemo(
    () => (rawConfig ? parseStoredConfig(rawConfig) : null),
    [rawConfig],
  );

  const saveConfig = useCallback((nextConfig: PublicDisplayConfig) => {
    setPublicDisplayConfig(nextConfig);
  }, []);

  const clearConfig = useCallback(() => {
    clearPublicDisplayConfig();
  }, []);

  return {
    config,
    isConfigReady,
    saveConfig,
    clearConfig,
  };
}

type UsePublicDisplayCallsOptions = {
  branchId: string | null;
  serviceIds: string[];
  maxItems?: number;
  onIncomingCall?: (ticket: PublicDisplayCalledTicket) => void;
};

type UsePublicDisplayCallsReturn = {
  tickets: PublicDisplayCalledTicket[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

type LiveTicketState = {
  scopeKey: string;
  tickets: PublicDisplayCalledTicket[];
};

export function usePublicDisplayCalls({
  branchId,
  serviceIds,
  maxItems = 10,
  onIncomingCall,
}: UsePublicDisplayCallsOptions): UsePublicDisplayCallsReturn {
  const { socket } = useSocket();
  const normalizedServiceIds = useMemo(
    () => normalizeServiceIds(serviceIds),
    [serviceIds],
  );
  const serviceIdsKey = normalizedServiceIds.join("|");
  const normalizedBranchId = (branchId ?? "").trim();
  const scopeKey = `${normalizedBranchId}:${serviceIdsKey}`;
  const enabled = normalizedBranchId.length > 0 && normalizedServiceIds.length > 0;

  const [liveTicketState, setLiveTicketState] = useState<LiveTicketState | null>(null);

  const callsQuery = useQuery({
    queryKey: ["public-display", "calls", normalizedBranchId, serviceIdsKey],
    enabled,
    queryFn: async () => {
      const paramsPayload = publicDisplayCallsQuerySchema.parse({
        branchId: normalizedBranchId,
        serviceIds: normalizedServiceIds,
      });

      const params = new URLSearchParams({
        branchId: paramsPayload.branchId,
        serviceIds: paramsPayload.serviceIds.join(","),
      });

      const response = await api.get<unknown>(`/public/display/calls?${params.toString()}`);
      const parsedResponse = publicDisplayCalledTicketListSchema.safeParse(response);

      if (!parsedResponse.success) {
        throw new Error("Formato de respuesta invalido para /public/display/calls");
      }

      if (Array.isArray(parsedResponse.data)) {
        return compactTicketList(parsedResponse.data, maxItems);
      }

      return compactTicketList(parsedResponse.data.data, maxItems);
    },
    staleTime: 15_000,
    refetchOnMount: "always",
    refetchInterval: 20_000,
  });

  const snapshotTickets = useMemo(
    () => callsQuery.data ?? [],
    [callsQuery.data],
  );

  const tickets = useMemo(() => {
    if (!enabled) {
      return [];
    }

    if (liveTicketState && liveTicketState.scopeKey === scopeKey) {
      return liveTicketState.tickets;
    }

    return snapshotTickets;
  }, [enabled, liveTicketState, scopeKey, snapshotTickets]);

  useEffect(() => {
    if (!socket || !enabled) {
      return;
    }

    Promise.all(
      normalizedServiceIds.map((serviceId) =>
        joinPublicQueue(
          {
            branchId: normalizedBranchId,
            serviceId,
          },
          socket,
        ).catch((error) => {
          console.error("No se pudo registrar cola publica", error);
        }),
      ),
    ).catch((error) => {
      console.error("No se pudieron registrar colas publicas", error);
    });

    const upsertTicket = (payload: unknown) => {
      const incomingTicket = parseSocketTicketPayload(payload);
      if (!incomingTicket) {
        return;
      }

      if (!isTicketInScope(incomingTicket, normalizedBranchId, normalizedServiceIds)) {
        return;
      }

      setLiveTicketState((previousState) => {
        const previousTickets =
          previousState && previousState.scopeKey === scopeKey
            ? previousState.tickets
            : snapshotTickets;

        const withoutCurrent = previousTickets.filter((item) => item.id !== incomingTicket.id);

        return {
          scopeKey,
          tickets: compactTicketList([incomingTicket, ...withoutCurrent], maxItems),
        };
      });

      onIncomingCall?.(incomingTicket);
    };

    const handleTicketUpdated = (payload: unknown) => {
      const incomingTicket = parseSocketTicketPayload(payload);
      if (!incomingTicket) {
        return;
      }

      if (!isTicketInScope(incomingTicket, normalizedBranchId, normalizedServiceIds)) {
        return;
      }

      if (incomingTicket.status === "LLAMADO") {
        setLiveTicketState((previousState) => {
          const previousTickets =
            previousState && previousState.scopeKey === scopeKey
              ? previousState.tickets
              : snapshotTickets;

          const withoutCurrent = previousTickets.filter((item) => item.id !== incomingTicket.id);

          return {
            scopeKey,
            tickets: compactTicketList([incomingTicket, ...withoutCurrent], maxItems),
          };
        });
        return;
      }

      setLiveTicketState((previousState) => {
        const previousTickets =
          previousState && previousState.scopeKey === scopeKey
            ? previousState.tickets
            : snapshotTickets;

        return {
          scopeKey,
          tickets: previousTickets.filter((item) => item.id !== incomingTicket.id),
        };
      });
    };

    const removeTicket = (payload: unknown) => {
      const incomingTicket = parseSocketTicketPayload(payload);
      if (!incomingTicket) {
        return;
      }

      if (!isTicketInScope(incomingTicket, normalizedBranchId, normalizedServiceIds)) {
        return;
      }

      setLiveTicketState((previousState) => {
        const previousTickets =
          previousState && previousState.scopeKey === scopeKey
            ? previousState.tickets
            : snapshotTickets;

        return {
          scopeKey,
          tickets: previousTickets.filter((item) => item.id !== incomingTicket.id),
        };
      });
    };

    socket.on("ticket:called", upsertTicket);
    socket.on("ticket:recalled", upsertTicket);
    socket.on("ticket:updated", handleTicketUpdated);
    socket.on("ticket:started", removeTicket);
    socket.on("ticket:held", removeTicket);
    socket.on("ticket:finished", removeTicket);
    socket.on("ticket:cancelled", removeTicket);

    return () => {
      socket.off("ticket:called", upsertTicket);
      socket.off("ticket:recalled", upsertTicket);
      socket.off("ticket:updated", handleTicketUpdated);
      socket.off("ticket:started", removeTicket);
      socket.off("ticket:held", removeTicket);
      socket.off("ticket:finished", removeTicket);
      socket.off("ticket:cancelled", removeTicket);
    };
  }, [
    socket,
    enabled,
    normalizedBranchId,
    serviceIdsKey,
    scopeKey,
    maxItems,
    onIncomingCall,
    normalizedServiceIds,
    snapshotTickets,
  ]);

  return {
    tickets,
    isLoading: callsQuery.isLoading,
    isFetching: callsQuery.isFetching,
    error: callsQuery.error as Error | null,
    refetch: callsQuery.refetch,
  };
}
