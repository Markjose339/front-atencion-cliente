"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PublicDisplayBoard } from "@/components/public-display/public-display-board";
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

const uniqueIds = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));

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

  const requiresConfiguration = isConfigReady && !config;

  const openSettings = (nextStep?: PublicDisplaySetupStep) => {
    const nextBranchId = config?.branchId ?? "";
    setDraftBranchId(nextBranchId);
    setDraftServiceIds(uniqueIds(config?.serviceIds ?? []));
    setSetupStep(nextStep ?? (nextBranchId ? "services" : "branch"));
    setSettingsOpen(true);
  };

  const displayCalls = usePublicDisplayCalls({
    branchId: config?.branchId ?? null,
    serviceIds: config?.serviceIds ?? [],
    maxItems: 12,
    onIncomingCall: announceTicket,
  });

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === config?.branchId) ?? null,
    [branches, config?.branchId],
  );

  const selectedServiceNames = useMemo(() => {
    if (!config) {
      return [];
    }

    const servicesById = new Map(
      (displayServicesQuery.data ?? []).map((service) => [service.serviceId, service.serviceName]),
    );

    return config.serviceIds.map((serviceId) => servicesById.get(serviceId) ?? serviceId);
  }, [config, displayServicesQuery.data]);

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
        ? previous.filter((value) => value !== serviceId)
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
    const filteredServiceIds = uniqueIds(draftServiceIds).filter((serviceId) =>
      availableServiceIds.has(serviceId),
    );

    if (filteredServiceIds.length === 0) {
      toast.error("Seleccione al menos un servicio");
      return;
    }

    saveConfig({
      branchId: draftBranchId,
      serviceIds: filteredServiceIds,
    });

    setSettingsOpen(false);
    toast.success("Pantalla configurada correctamente");
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  const handleReload = async () => {
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
        tickets={displayCalls.tickets}
        isLoading={displayCalls.isLoading}
        isFetching={displayCalls.isFetching}
        errorMessage={displayCalls.error?.message ?? null}
        isVoiceSupported={isVoiceSupported}
        voiceEnabled={voiceEnabled}
        isAnnouncing={isAnnouncing}
        requiresConfiguration={requiresConfiguration}
        onToggleVoice={handleToggleVoice}
        onReload={handleReload}
        onOpenSettings={handleOpenSettings}
      />

      <Sheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      >
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
