"use client";

import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useCustomerServiceMutation,
  useCustomerServiceQuery,
  useCustomerServiceWindows,
} from "@/hooks/use-customer-service";
import {
  CustomerServiceCalledTicket,
  CustomerServiceWindowOption,
} from "@/types/customer-service";

import { CustomerServiceActiveTicketCard } from "./customer-service-active-ticket-card";
import { CustomerServiceHeader } from "./customer-service-header";
import { CustomerServiceTable } from "./customer-service-table";
import { getCustomerServiceErrorText } from "./customer-service-utils";
import { CustomerServiceWindowSelector } from "./customer-service-window-selector";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

export function CustomerServiceWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    finishTicketAttention,
    cancelTicket,
  } = useCustomerServiceMutation();

  const [calledTicketState, setCalledTicketState] = useState<{
    scopeKey: string;
    ticket: CustomerServiceCalledTicket;
  } | null>(null);

  const options = useMemo(() => windowsQuery.data ?? [], [windowsQuery.data]);

  const selectedOption = useMemo(
    () =>
      options.find(
        (option) => option.branchId === branchId && option.serviceId === serviceId,
      ) ?? null,
    [options, branchId, serviceId],
  );
  const selectedScopeKey = selectedOption
    ? `${selectedOption.branchId}:${selectedOption.serviceId}`
    : "";

  const updateURL = useCallback(
    (next: {
      page: number;
      limit: number;
      search: string;
      branchId?: string;
      serviceId?: string;
    }) => {
      const params = new URLSearchParams();
      params.set("page", next.page.toString());
      params.set("limit", next.limit.toString());

      const trimmedSearch = next.search.trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (next.branchId) {
        params.set("branchId", next.branchId);
      }

      if (next.serviceId) {
        params.set("serviceId", next.serviceId);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (windowsQuery.isLoading) {
      return;
    }

    if (options.length !== 1) {
      return;
    }

    const onlyOption = options[0];

    if (branchId === onlyOption.branchId && serviceId === onlyOption.serviceId) {
      return;
    }

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

  const calledTicket = useMemo(() => {
    if (!calledTicketState) {
      return null;
    }

    if (!selectedScopeKey || calledTicketState.scopeKey !== selectedScopeKey) {
      return null;
    }

    if (response?.isAttendingTicket) {
      return null;
    }

    return calledTicketState.ticket;
  }, [calledTicketState, response?.isAttendingTicket, selectedScopeKey]);

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

  const onCallNext = async () => {
    if (!selectedOption) {
      return;
    }

    toast.promise(
      callNextTicket.mutateAsync({
        branchId: selectedOption.branchId,
        serviceId: selectedOption.serviceId,
      }),
      {
        loading: "Llamando siguiente ticket...",
        success: (ticket) => {
          if (!ticket) {
            return "No hay tickets pendientes";
          }

          setCalledTicketState({
            scopeKey: `${ticket.branchId}:${ticket.serviceId}`,
            ticket,
          });
          return `Ticket "${ticket.code}" llamado correctamente`;
        },
        error: (error) =>
          getCustomerServiceErrorText(error, "No se pudo llamar al siguiente ticket"),
      },
    );
  };

  const onRecallTicket = async () => {
    if (!calledTicket) {
      return;
    }

    toast.promise(recallTicket.mutateAsync(calledTicket.id), {
      loading: "Re-llamando ticket...",
      success: (data) => {
        setCalledTicketState({
          scopeKey: `${data.ticket.branchId}:${data.ticket.serviceId}`,
          ticket: data.ticket,
        });
        return data.message;
      },
      error: (error) => getCustomerServiceErrorText(error, "No se pudo re-llamar"),
    });
  };

  const onStartAttention = async () => {
    if (!calledTicket) {
      return;
    }

    toast.promise(startTicketAttention.mutateAsync(calledTicket.id), {
      loading: "Iniciando atencion...",
      success: (data) => {
        setCalledTicketState(null);
        return data.message;
      },
      error: (error) =>
        getCustomerServiceErrorText(error, "No se pudo iniciar la atencion"),
    });
  };

  const onCancelCalled = async () => {
    if (!calledTicket) {
      return;
    }

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
    if (!currentAttendingTicket) {
      return;
    }

    toast.promise(finishTicketAttention.mutateAsync(currentAttendingTicket.id), {
      loading: "Finalizando atencion...",
      success: (data) => data.message,
      error: (error) =>
        getCustomerServiceErrorText(error, "No se pudo finalizar la atencion"),
    });
  };

  if (windowsQuery.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {getCustomerServiceErrorText(
            windowsQuery.error,
            "No se pudo cargar tus ventanillas",
          )}
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
    return (
      <CustomerServiceWindowSelector
        options={options}
        onSelectWindow={handleSelectWindow}
      />
    );
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

  return (
    <div className="space-y-6">
      <CustomerServiceHeader
        selectedOption={selectedOption}
        canChangeWindow={options.length > 1}
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
        onCancelCalled={onCancelCalled}
        onFinishAttention={onFinishAttention}
        recalling={recallTicket.isPending}
        starting={startTicketAttention.isPending}
        cancelling={cancelTicket.isPending}
        finishing={finishTicketAttention.isPending}
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
