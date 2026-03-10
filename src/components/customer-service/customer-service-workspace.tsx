"use client";

import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useCustomerServiceMutation,
  useCustomerServiceQuery,
  useCustomerServiceWindows,
} from "@/hooks/use-customer-service";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useSocket } from "@/hooks/use-socket";
import {
  CustomerServiceCalledTicket,
  CustomerServiceHeldTicket,
  CustomerServiceWindowOption,
} from "@/types/customer-service";

import { CustomerServiceActiveTicketCard } from "./customer-service-active-ticket-card";
import { CustomerServiceHeader } from "./customer-service-header";
import { CustomerServiceHeldTickets } from "./customer-service-held-tickets";
import { CustomerServiceTable } from "./customer-service-table";
import { getCustomerServiceErrorText } from "./customer-service-utils";
import { CustomerServiceWindowSelector } from "./customer-service-window-selector";

type CalledTicketState = {
  scopeKey: string;
  ticket: CustomerServiceCalledTicket;
};

const MAX_HELD_TICKETS = 3;
const HOLD_LIMIT_ERROR_MESSAGE = "No puedes tener mas de 3 tickets en espera";
const RECALL_CONFLICT_CALLED_ERROR_MESSAGE =
  "No puedes re-llamar un ticket en espera mientras tienes uno en estado LLAMADO";
const RECALL_CONFLICT_ATTENDING_ERROR_MESSAGE =
  "No puedes re-llamar un ticket en espera mientras tienes uno en ATENDIENDO";
const RESUME_CONFLICT_CALLED_ERROR_MESSAGE =
  "No puedes reanudar un ticket en espera mientras tienes uno en estado LLAMADO";
const RESUME_CONFLICT_ATTENDING_ERROR_MESSAGE =
  "No puedes reanudar un ticket en espera mientras tienes uno en ATENDIENDO";
const CALL_NEXT_EMPTY_SERVICE_MESSAGE = "No hay tickets disponibles para tu servicio";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.trunc(parsed);
};

type TicketScope = {
  branchId: string;
  serviceId: string;
};

const parseTicketScope = (payload: unknown): TicketScope | null => {
  if (!payload || typeof payload !== "object") return null;

  const source = payload as Record<string, unknown>;
  const nestedPayload =
    source.ticket && typeof source.ticket === "object"
      ? (source.ticket as Record<string, unknown>)
      : source.data && typeof source.data === "object"
        ? (source.data as Record<string, unknown>)
        : source;

  const branchId =
    typeof nestedPayload.branchId === "string" ? nestedPayload.branchId.trim() : "";
  const serviceId =
    typeof nestedPayload.serviceId === "string" ? nestedPayload.serviceId.trim() : "";

  if (!branchId || !serviceId) return null;
  return { branchId, serviceId };
};

const isCallNextEmptyServiceError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const record = error as Record<string, unknown>;
  const status = typeof record.status === "number" ? record.status : null;
  const message = getCustomerServiceErrorText(error, "");

  return status === 404 && message === CALL_NEXT_EMPTY_SERVICE_MESSAGE;
};

export function CustomerServiceWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocket();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);
  const search = searchParams.get("search") || "";
  const branchId = searchParams.get("branchId") || "";
  const serviceId = searchParams.get("serviceId") || "";

  const { windowsQuery } = useCustomerServiceWindows();
  const {
    callNextTicket,
    recallTicket,
    startTicketAttention,
    holdTicket,
    finishTicketAttention,
    cancelTicket,
  } = useCustomerServiceMutation();

  const [calledTicketState, setCalledTicketState] = useState<CalledTicketState | null>(null);
  const [loadingHoldById, setLoadingHoldById] = useState<Record<string, boolean>>({});
  const [loadingRecallById, setLoadingRecallById] = useState<Record<string, boolean>>({});
  const [loadingStartById, setLoadingStartById] = useState<Record<string, boolean>>({});
  const holdInFlightRef = useRef<Set<string>>(new Set());
  const recallInFlightRef = useRef<Set<string>>(new Set());
  const startInFlightRef = useRef<Set<string>>(new Set());

  const { playNotification, unlockAudio } = useNotificationSound();
  const primedAudioRef = useRef(false);
  const lastBeepAtRef = useRef(0);

  const options = useMemo(() => windowsQuery.data ?? [], [windowsQuery.data]);

  const selectedOption = useMemo(
    () =>
      options.find((option) => option.branchId === branchId && option.serviceId === serviceId) ??
      null,
    [options, branchId, serviceId],
  );

  const selectedScopeKey = selectedOption
    ? `${selectedOption.branchId}:${selectedOption.serviceId}`
    : "";

  const rateUrl = useMemo(() => {
    if (!selectedOption) return "/rate";

    const params = new URLSearchParams({
      branchId: selectedOption.branchId,
      windowId: selectedOption.windowId,
    });

    return `/rate?${params.toString()}`;
  }, [selectedOption]);

  const updateURL = useCallback(
    (next: { page: number; limit: number; search: string; branchId?: string; serviceId?: string }) => {
      const params = new URLSearchParams();
      params.set("page", next.page.toString());
      params.set("limit", next.limit.toString());

      const trimmedSearch = next.search.trim();
      if (trimmedSearch) params.set("search", trimmedSearch);

      if (next.branchId) params.set("branchId", next.branchId);
      if (next.serviceId) params.set("serviceId", next.serviceId);

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (windowsQuery.isLoading) return;
    if (options.length !== 1) return;

    const onlyOption = options[0];

    if (branchId === onlyOption.branchId && serviceId === onlyOption.serviceId) return;

    updateURL({
      page: 1,
      limit,
      search,
      branchId: onlyOption.branchId,
      serviceId: onlyOption.serviceId,
    });
  }, [windowsQuery.isLoading, options, branchId, serviceId, updateURL, limit, search]);

  const { findPendingTicketsByUserServiceWindow } = useCustomerServiceQuery({
    page,
    limit,
    search,
    branchId: selectedOption?.branchId,
    serviceId: selectedOption?.serviceId,
  });

  const {
    data: response,
    isLoading: queueLoading,
    error: queueError,
    refetch,
  } = findPendingTicketsByUserServiceWindow;

  const currentAttendingTicket = useMemo(
    () => response?.data.find((ticket) => ticket.status === "ATENDIENDO") ?? null,
    [response?.data],
  );

  const heldTickets = useMemo(() => response?.heldTickets ?? [], [response?.heldTickets]);
  const isHeldTicketsLimitReached = heldTickets.length >= MAX_HELD_TICKETS;

  const backendCalledTicket = useMemo(() => {
    const ticket = response?.calledTicket;
    if (!ticket || !selectedScopeKey) return null;

    const ticketScopeKey = `${ticket.branchId}:${ticket.serviceId}`;
    if (ticketScopeKey !== selectedScopeKey) return null;

    return ticket;
  }, [response?.calledTicket, selectedScopeKey]);

  const calledTicket = useMemo(() => {
    if (backendCalledTicket) return backendCalledTicket;
    if (!calledTicketState) return null;
    if (!selectedScopeKey || calledTicketState.scopeKey !== selectedScopeKey) return null;
    if (response?.isAttendingTicket) return null;
    return calledTicketState.ticket;
  }, [backendCalledTicket, calledTicketState, response?.isAttendingTicket, selectedScopeKey]);

  useEffect(() => {
    if (!socket || !selectedOption) return;

    const handleTicketCreated = async (payload: unknown) => {
      const ticketScope = parseTicketScope(payload);

      if (ticketScope) {
        const isSameScope =
          ticketScope.branchId === selectedOption.branchId &&
          ticketScope.serviceId === selectedOption.serviceId;

        if (!isSameScope) return;
      }

      if (!primedAudioRef.current) {
        await unlockAudio();
        primedAudioRef.current = true;
      }

      const now = Date.now();
      if (now - lastBeepAtRef.current < 700) return;
      lastBeepAtRef.current = now;

      await playNotification("operator");
    };

    socket.on("ticket:created", handleTicketCreated);

    return () => {
      socket.off("ticket:created", handleTicketCreated);
    };
  }, [playNotification, unlockAudio, selectedOption, socket]);

  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      updateURL({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
        branchId: selectedOption?.branchId,
        serviceId: selectedOption?.serviceId,
      });
    },
    [updateURL, search, selectedOption],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({
        page: 1,
        limit,
        search: value,
        branchId: selectedOption?.branchId,
        serviceId: selectedOption?.serviceId,
      });
    },
    [updateURL, limit, selectedOption],
  );

  const handleSelectWindow = useCallback(
    (option: CustomerServiceWindowOption) => {
      updateURL({
        page: 1,
        limit,
        search: "",
        branchId: option.branchId,
        serviceId: option.serviceId,
      });
    },
    [updateURL, limit],
  );

  const handleChangeWindow = useCallback(() => {
    updateURL({
      page: 1,
      limit,
      search: "",
      branchId: "",
      serviceId: "",
    });
  }, [updateURL, limit]);

  const refreshQueue = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const getHoldErrorText = useCallback((error: unknown) => {
    return getCustomerServiceErrorText(error, "No se pudo poner el ticket en espera");
  }, []);

  const getRecallErrorText = useCallback((error: unknown) => {
    return getCustomerServiceErrorText(error, "No se pudo re-llamar");
  }, []);

  const getStartErrorText = useCallback((error: unknown) => {
    return getCustomerServiceErrorText(error, "No se pudo iniciar la atencion");
  }, []);

  const onCallNext = async () => {
    if (!selectedOption) return;

    try {
      const ticket = await callNextTicket.mutateAsync({
        branchId: selectedOption.branchId,
        serviceId: selectedOption.serviceId,
      });

      if (!ticket) {
        toast.info("No hay tickets pendientes");
        return;
      }

      setCalledTicketState({
        scopeKey: `${ticket.branchId}:${ticket.serviceId}`,
        ticket,
      });

      toast.success(`Ticket "${ticket.code}" llamado correctamente`);
    } catch (error) {
      if (isCallNextEmptyServiceError(error)) {
        toast.info(CALL_NEXT_EMPTY_SERVICE_MESSAGE);
        return;
      }

      toast.error(getCustomerServiceErrorText(error, "No se pudo llamar al siguiente ticket"));
    }
  };

  const onRecallByTicketId = useCallback(
    async (ticketId: string) => {
      if (recallInFlightRef.current.has(ticketId)) return;

      recallInFlightRef.current.add(ticketId);
      setLoadingRecallById((previous) => ({ ...previous, [ticketId]: true }));

      const mutationPromise = (async () => {
        const data = await recallTicket.mutateAsync(ticketId);
        setCalledTicketState({
          scopeKey: `${data.ticket.branchId}:${data.ticket.serviceId}`,
          ticket: data.ticket,
        });
        await refreshQueue();
        return data;
      })();

      toast.promise(mutationPromise, {
        loading: "Re-llamando ticket...",
        success: (data) => data.message,
        error: (error) => getRecallErrorText(error),
      });

      try {
        await mutationPromise;
      } catch {
      } finally {
        recallInFlightRef.current.delete(ticketId);
        setLoadingRecallById((previous) => {
          const next = { ...previous };
          delete next[ticketId];
          return next;
        });
      }
    },
    [recallTicket, refreshQueue, getRecallErrorText],
  );

  const onRecallTicket = async () => {
    if (!calledTicket) return;
    await onRecallByTicketId(calledTicket.id);
  };

  const selectHeldTicketService = useCallback(
    (ticket: CustomerServiceHeldTicket): boolean => {
      if (!selectedOption) return false;

      const isSameService =
        ticket.branchId === selectedOption.branchId && ticket.serviceId === selectedOption.serviceId;

      if (isSameService) return true;

      const matchingOption = options.find(
        (option) => option.branchId === ticket.branchId && option.serviceId === ticket.serviceId,
      );

      if (!matchingOption) {
        toast.error(`No tienes una ventanilla asignada para el servicio "${ticket.serviceName}"`);
        return false;
      }

      updateURL({
        page: 1,
        limit,
        search: "",
        branchId: matchingOption.branchId,
        serviceId: matchingOption.serviceId,
      });

      return false;
    },
    [selectedOption, options, updateURL, limit],
  );

  const onSelectHeldTicket = useCallback(
    (ticket: CustomerServiceHeldTicket) => {
      selectHeldTicketService(ticket);
    },
    [selectHeldTicketService],
  );

  const onRecallHeldTicket = async (ticket: CustomerServiceHeldTicket) => {
    if (!selectHeldTicketService(ticket)) return;

    if (calledTicket && calledTicket.id !== ticket.id) {
      toast.error(RECALL_CONFLICT_CALLED_ERROR_MESSAGE);
      return;
    }

    if (
      (currentAttendingTicket && currentAttendingTicket.id !== ticket.id) ||
      response?.isAttendingTicket
    ) {
      toast.error(RECALL_CONFLICT_ATTENDING_ERROR_MESSAGE);
      return;
    }

    await onRecallByTicketId(ticket.id);
  };

  const onStartByTicketId = useCallback(
    async (ticketId: string) => {
      if (startInFlightRef.current.has(ticketId)) return;

      startInFlightRef.current.add(ticketId);
      setLoadingStartById((previous) => ({ ...previous, [ticketId]: true }));

      const mutationPromise = (async () => {
        const data = await startTicketAttention.mutateAsync(ticketId);
        setCalledTicketState(null);
        await refreshQueue();
        return data;
      })();

      toast.promise(mutationPromise, {
        loading: "Iniciando atencion...",
        success: (data) => data.message,
        error: (error) => getStartErrorText(error),
      });

      try {
        await mutationPromise;
      } catch {
      } finally {
        startInFlightRef.current.delete(ticketId);
        setLoadingStartById((previous) => {
          const next = { ...previous };
          delete next[ticketId];
          return next;
        });
      }
    },
    [startTicketAttention, refreshQueue, getStartErrorText],
  );

  const onStartAttention = async () => {
    if (!calledTicket) return;
    await onStartByTicketId(calledTicket.id);
  };

  const onResumeHeldAttention = async (ticket: CustomerServiceHeldTicket) => {
    if (!selectHeldTicketService(ticket)) return;

    if (calledTicket && calledTicket.id !== ticket.id) {
      toast.error(RESUME_CONFLICT_CALLED_ERROR_MESSAGE);
      return;
    }

    if (
      (currentAttendingTicket && currentAttendingTicket.id !== ticket.id) ||
      response?.isAttendingTicket
    ) {
      toast.error(RESUME_CONFLICT_ATTENDING_ERROR_MESSAGE);
      return;
    }

    await onStartByTicketId(ticket.id);
  };

  const onHoldByTicketId = useCallback(
    async (ticketId: string) => {
      if (holdInFlightRef.current.has(ticketId)) return;

      holdInFlightRef.current.add(ticketId);
      setLoadingHoldById((previous) => ({ ...previous, [ticketId]: true }));

      const mutationPromise = (async () => {
        const data = await holdTicket.mutateAsync(ticketId);
        setCalledTicketState(null);
        await refreshQueue();
        return data;
      })();

      toast.promise(mutationPromise, {
        loading: "Poniendo ticket en espera...",
        success: (data) => data.message,
        error: (error) => getHoldErrorText(error),
      });

      try {
        await mutationPromise;
      } catch {
      } finally {
        holdInFlightRef.current.delete(ticketId);
        setLoadingHoldById((previous) => {
          const next = { ...previous };
          delete next[ticketId];
          return next;
        });
      }
    },
    [holdTicket, refreshQueue, getHoldErrorText],
  );

  const onHoldAttention = async () => {
    if (!currentAttendingTicket) return;

    if (isHeldTicketsLimitReached) {
      toast.error(HOLD_LIMIT_ERROR_MESSAGE);
      return;
    }

    await onHoldByTicketId(currentAttendingTicket.id);
  };

  const onCancelCalled = async () => {
    if (!calledTicket) return;

    toast.promise(cancelTicket.mutateAsync(calledTicket.id), {
      loading: "Cancelando ticket...",
      success: (data) => {
        setCalledTicketState(null);
        return data.message;
      },
      error: (error) => getCustomerServiceErrorText(error, "No se pudo cancelar el ticket"),
    });
  };

  const onFinishAttention = async () => {
    if (!currentAttendingTicket) return;

    toast.promise(finishTicketAttention.mutateAsync(currentAttendingTicket.id), {
      loading: "Finalizando atencion...",
      success: (data) => {
        setCalledTicketState(null);
        return data.message;
      },
      error: (error) => getCustomerServiceErrorText(error, "No se pudo finalizar la atencion"),
    });
  };

  if (windowsQuery.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {getCustomerServiceErrorText(windowsQuery.error, "No se pudo cargar tus ventanillas")}
        </p>
      </div>
    );
  }

  if (windowsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        Cargando ventanillas...
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center">
        <AlertCircle className="h-9 w-9 text-amber-500" />
        <p className="text-sm font-medium">No tienes ventanillas asignadas</p>
        <p className="text-xs text-muted-foreground">
          Solicita una asignacion activa para poder atender tickets.
        </p>
      </div>
    );
  }

  if (!selectedOption && options.length > 1) {
    return <CustomerServiceWindowSelector options={options} onSelectWindow={handleSelectWindow} />;
  }

  if (!selectedOption && options.length === 1) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        Preparando ventanilla...
      </div>
    );
  }

  if (!selectedOption) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center">
        <AlertCircle className="h-9 w-9 text-amber-500" />
        <p className="text-sm font-medium">No se pudo resolver la ventanilla seleccionada</p>
      </div>
    );
  }

  if (queueError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {getCustomerServiceErrorText(queueError, "Ocurrio un error inesperado")}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const disableCallNext =
    queueLoading ||
    callNextTicket.isPending ||
    Boolean(calledTicket) ||
    Boolean(currentAttendingTicket) ||
    Boolean(response?.isAttendingTicket);

  const hasActiveCalledTicket = Boolean(calledTicket);
  const hasActiveAttendingTicket = Boolean(currentAttendingTicket) || Boolean(response?.isAttendingTicket);

  const recallBlockedByCalledMessage = hasActiveCalledTicket ? RECALL_CONFLICT_CALLED_ERROR_MESSAGE : null;
  const recallBlockedByAttendingMessage = hasActiveAttendingTicket ? RECALL_CONFLICT_ATTENDING_ERROR_MESSAGE : null;
  const resumeBlockedByCalledMessage = hasActiveCalledTicket ? RESUME_CONFLICT_CALLED_ERROR_MESSAGE : null;
  const resumeBlockedByAttendingMessage = hasActiveAttendingTicket ? RESUME_CONFLICT_ATTENDING_ERROR_MESSAGE : null;

  const currentAttendingHoldLoading = currentAttendingTicket
    ? Boolean(loadingHoldById[currentAttendingTicket.id])
    : false;

  const calledTicketStartLoading = calledTicket ? Boolean(loadingStartById[calledTicket.id]) : false;

  return (
    <div className="space-y-6">
      <CustomerServiceHeader
        selectedOption={selectedOption}
        canChangeWindow={options.length > 1}
        rateUrl={rateUrl}
        onChangeWindow={handleChangeWindow}
        onCallNext={onCallNext}
        isCallingNext={callNextTicket.isPending}
        disableCallNext={disableCallNext}
      />

      <CustomerServiceActiveTicketCard
        calledTicket={calledTicket}
        attendingTicket={currentAttendingTicket}
        isAttendingTicket={Boolean(response?.isAttendingTicket)}
        onRecall={onRecallTicket}
        onStartAttention={onStartAttention}
        onHoldAttention={onHoldAttention}
        onCancelCalled={onCancelCalled}
        onFinishAttention={onFinishAttention}
        recalling={recallTicket.isPending}
        starting={calledTicketStartLoading}
        holding={currentAttendingHoldLoading}
        disableHoldAttention={isHeldTicketsLimitReached}
        cancelling={cancelTicket.isPending}
        finishing={finishTicketAttention.isPending}
      />

      <CustomerServiceHeldTickets
        tickets={heldTickets}
        maxHeldTickets={MAX_HELD_TICKETS}
        loadingRecallById={loadingRecallById}
        loadingStartById={loadingStartById}
        activeCalledTicketId={calledTicket?.id ?? null}
        activeAttendingTicketId={currentAttendingTicket?.id ?? null}
        isAttendingTicket={Boolean(response?.isAttendingTicket)}
        recallBlockedByCalledMessage={recallBlockedByCalledMessage}
        recallBlockedByAttendingMessage={recallBlockedByAttendingMessage}
        resumeBlockedByCalledMessage={resumeBlockedByCalledMessage}
        resumeBlockedByAttendingMessage={resumeBlockedByAttendingMessage}
        onSelectTicket={onSelectHeldTicket}
        onRecall={onRecallHeldTicket}
        onResumeAttention={onResumeHeldAttention}
      />

      <CustomerServiceTable
        data={response?.data ?? []}
        loading={queueLoading}
        page={page}
        limit={limit}
        search={search}
        pageCount={response?.meta?.totalPages ?? 0}
        totalItems={response?.meta?.total ?? 0}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}
