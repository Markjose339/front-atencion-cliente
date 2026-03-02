"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  PublicDisplaySetup,
  PublicDisplaySetupStep,
} from "@/components/public-display/public-display-setup";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePublicDisplayCalls, usePublicDisplayConfig } from "@/hooks/use-public-display";
import { usePublicBranches, usePublicServicesByBranch } from "@/hooks/use-public";
import { useTicketAnnouncer } from "@/hooks/use-ticket-announcer";
import { PublicDisplayCalledTicket } from "@/types/public-display";
import { PublicDisplayBoard } from "@/components/public-display/public-display-board";

const MAX_VISIBLE = 12;
const VISUAL_ALERT_DURATION_MS = 30_000;
const VISUAL_ALERT_MAX_ITEMS = 20;

const uniqueIds = (values: string[]): string[] =>
  Array.from(new Set(values.map((v) => v.trim()).filter((v) => v.length > 0)));

function upsertQueue(
  prev: PublicDisplayCalledTicket[],
  incoming: PublicDisplayCalledTicket,
): PublicDisplayCalledTicket[] {
  const id = String(incoming.id);
  const withoutDup = prev.filter((x) => String(x.id) !== id);
  return [incoming, ...withoutDup].slice(0, MAX_VISIBLE);
}

export default function Home() {
  const { data: branches = [], isLoading: loadingBranches } = usePublicBranches();
  const { config, isConfigReady, saveConfig } = usePublicDisplayConfig();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<PublicDisplaySetupStep>("branch");

  const [draftBranchId, setDraftBranchId] = useState<string>(config?.branchId ?? "");
  const [draftServiceIds, setDraftServiceIds] = useState<string[]>(() =>
    uniqueIds(config?.serviceIds ?? []),
  );

  const setupServicesQuery = usePublicServicesByBranch(draftBranchId || null);
  const displayServicesQuery = usePublicServicesByBranch(config?.branchId ?? null);

  const { isVoiceSupported, voiceEnabled, isAnnouncing, setVoiceEnabled, announceTicket } =
    useTicketAnnouncer();

  const [highlightedCallKeys, setHighlightedCallKeys] = useState<string[]>([]);
  const visualAlertTimersRef = useRef<Record<string, number>>({});

  const requiresConfiguration = isConfigReady && !config;

  const scopeKey = `${config?.branchId ?? ""}:${(config?.serviceIds ?? []).join("|")}`;
  const [displayTickets, setDisplayTickets] = useState<PublicDisplayCalledTicket[]>([]);
  const [lastSeededScopeKey, setLastSeededScopeKey] = useState<string | null>(null);

  if (lastSeededScopeKey !== null && lastSeededScopeKey !== scopeKey) {
    setLastSeededScopeKey(scopeKey);
    setDisplayTickets([]);
  }

  const clearVisualAlertTimer = useCallback((key: string) => {
    const timerId = visualAlertTimersRef.current[key];
    if (typeof timerId !== "number") return;
    window.clearTimeout(timerId);
    delete visualAlertTimersRef.current[key];
  }, []);

  const queueVisualAlert = useCallback(
    (ticket: PublicDisplayCalledTicket) => {
      const key = `${ticket.id}:${ticket.calledAt ?? ticket.createdAt}`;

      clearVisualAlertTimer(key);

      setHighlightedCallKeys((previous) => {
        const withNew = previous.includes(key) ? previous : [key, ...previous];
        if (withNew.length <= VISUAL_ALERT_MAX_ITEMS) return withNew;

        const kept = withNew.slice(0, VISUAL_ALERT_MAX_ITEMS);
        const removed = withNew.slice(VISUAL_ALERT_MAX_ITEMS);
        removed.forEach(clearVisualAlertTimer);
        return kept;
      });

      visualAlertTimersRef.current[key] = window.setTimeout(() => {
        setHighlightedCallKeys((previous) => previous.filter((item) => item !== key));
        delete visualAlertTimersRef.current[key];
      }, VISUAL_ALERT_DURATION_MS);
    },
    [clearVisualAlertTimer],
  );

  useEffect(
    () => () => {
      Object.values(visualAlertTimersRef.current).forEach((id) => window.clearTimeout(id));
      visualAlertTimersRef.current = {};
    },
    [],
  );

  const handleIncomingCall = useCallback(
    (ticket: PublicDisplayCalledTicket) => {
      queueVisualAlert(ticket);
      announceTicket(ticket);
      setDisplayTickets((prev) => upsertQueue(prev, ticket));
    },
    [announceTicket, queueVisualAlert],
  );

  const displayCalls = usePublicDisplayCalls({
    branchId: config?.branchId ?? null,
    serviceIds: config?.serviceIds ?? [],
    maxItems: MAX_VISIBLE,
    onIncomingCall: handleIncomingCall,
  });

  useEffect(() => {
    if (!displayCalls.tickets?.length) return;
    if (lastSeededScopeKey === scopeKey) return;

    setLastSeededScopeKey(scopeKey);
    setDisplayTickets(displayCalls.tickets.slice(0, MAX_VISIBLE));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayCalls.tickets, scopeKey]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === config?.branchId) ?? null,
    [branches, config?.branchId],
  );

  const selectedServiceNames = useMemo(() => {
    if (!config) return [];

    const servicesById = new Map(
      (displayServicesQuery.data ?? []).map((service) => [service.serviceId, service.serviceName]),
    );

    return config.serviceIds.map((serviceId) => servicesById.get(serviceId) ?? serviceId);
  }, [config, displayServicesQuery.data]);

  const openSettings = (nextStep?: PublicDisplaySetupStep) => {
    const nextBranchId = config?.branchId ?? "";
    setDraftBranchId(nextBranchId);
    setDraftServiceIds(uniqueIds(config?.serviceIds ?? []));
    setSetupStep(nextStep ?? (nextBranchId ? "services" : "branch"));
    setSettingsOpen(true);
  };

  const handleSelectBranch = (branchId: string) => {
    setDraftBranchId(branchId);
    setDraftServiceIds([]);
    setSetupStep("services");
  };

  const handleBackToBranches = () => {
    setSetupStep("branch");
  };

  const handleToggleService = (serviceId: string) => {
    setDraftServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((v) => v !== serviceId)
        : [...previous, serviceId],
    );
  };

  const handleSaveConfiguration = () => {
    if (!draftBranchId) {
      toast.error("Seleccione una sucursal");
      return;
    }

    const availableServiceIds = new Set(
      (setupServicesQuery.data ?? []).map((service) => service.serviceId),
    );
    const filteredServiceIds = uniqueIds(draftServiceIds).filter((id) =>
      availableServiceIds.has(id),
    );

    if (filteredServiceIds.length === 0) {
      toast.error("Seleccione al menos un servicio");
      return;
    }

    saveConfig({ branchId: draftBranchId, serviceIds: filteredServiceIds });
    setSettingsOpen(false);
    toast.success("Pantalla configurada correctamente");
  };

  const handleReload = async () => {
    setLastSeededScopeKey(null);
    await displayCalls.refetch();
    toast.success("Pantalla actualizada");
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <>
      <PublicDisplayBoard
        branchName={selectedBranch?.name ?? "Pantalla sin configurar"}
        selectedServiceNames={selectedServiceNames}
        tickets={displayTickets}
        isLoading={displayCalls.isLoading}
        isFetching={displayCalls.isFetching}
        errorMessage={displayCalls.error?.message ?? null}
        isVoiceSupported={isVoiceSupported}
        voiceEnabled={voiceEnabled}
        isAnnouncing={isAnnouncing}
        highlightedCallKeys={highlightedCallKeys}
        requiresConfiguration={requiresConfiguration}
        onToggleVoice={handleToggleVoice}
        onReload={handleReload}
        onOpenSettings={() => openSettings()}
      />

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l-[#20539A]/20 sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Configurar pantalla publica</SheetTitle>
            <SheetDescription>
              Primero seleccione la sucursal y luego los servicios a mostrar.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4">
            <PublicDisplaySetup
              branches={branches}
              services={setupServicesQuery.data ?? []}
              loadingBranches={loadingBranches}
              loadingServices={setupServicesQuery.isLoading}
              selectedBranchId={draftBranchId}
              selectedServiceIds={draftServiceIds}
              step={setupStep}
              onSelectBranch={handleSelectBranch}
              onBackToBranches={handleBackToBranches}
              onToggleService={handleToggleService}
              onSaveConfiguration={handleSaveConfiguration}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}