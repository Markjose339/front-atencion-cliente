"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PublicDisplayBoard } from "@/components/public-display/public-display-board";
import { PublicDisplaySetup } from "@/components/public-display/public-display-setup";
import { usePublicDisplayCalls, usePublicDisplayConfig } from "@/hooks/use-public-display";
import { usePublicBranches, usePublicServicesByBranch } from "@/hooks/use-public";
import { useTicketAnnouncer } from "@/hooks/use-ticket-announcer";

const uniqueIds = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));

export default function Home() {
  const { data: branches = [], isLoading: loadingBranches } = usePublicBranches();
  const { config, isConfigReady, saveConfig } = usePublicDisplayConfig();
  const [manualEditing, setManualEditing] = useState<boolean | null>(null);

  const [draftBranchId, setDraftBranchId] = useState<string>(config?.branchId ?? "");
  const [draftServiceIds, setDraftServiceIds] = useState<string[]>(() =>
    uniqueIds(config?.serviceIds ?? []),
  );

  const setupServicesQuery = usePublicServicesByBranch(draftBranchId || null);
  const displayServicesQuery = usePublicServicesByBranch(config?.branchId ?? null);

  const { isVoiceSupported, voiceEnabled, setVoiceEnabled, announceTicket } =
    useTicketAnnouncer();

  const isEditing =
    manualEditing === null
      ? !isConfigReady || !config
      : manualEditing || !config;

  const displayCalls = usePublicDisplayCalls({
    branchId: isEditing ? null : (config?.branchId ?? null),
    serviceIds: isEditing ? [] : (config?.serviceIds ?? []),
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

    setManualEditing(false);
    toast.success("Pantalla configurada correctamente");
  };

  const handleOpenSettings = () => {
    setDraftBranchId(config?.branchId ?? "");
    setDraftServiceIds(uniqueIds(config?.serviceIds ?? []));
    setManualEditing(true);
  };

  const handleReload = async () => {
    await displayCalls.refetch();
    toast.success("Pantalla actualizada");
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  if (!isConfigReady || isEditing || !config) {
    return (
      <PublicDisplaySetup
        branches={branches}
        services={setupServicesQuery.data ?? []}
        loadingBranches={loadingBranches}
        loadingServices={setupServicesQuery.isLoading}
        selectedBranchId={draftBranchId}
        selectedServiceIds={draftServiceIds}
        onSelectBranch={handleSelectBranch}
        onToggleService={handleToggleService}
        onSaveConfiguration={handleSaveConfiguration}
      />
    );
  }

  return (
    <PublicDisplayBoard
      branchName={selectedBranch?.name ?? "Sucursal no disponible"}
      selectedServiceNames={selectedServiceNames}
      tickets={displayCalls.tickets}
      isLoading={displayCalls.isLoading}
      isFetching={displayCalls.isFetching}
      errorMessage={displayCalls.error?.message ?? null}
      isVoiceSupported={isVoiceSupported}
      voiceEnabled={voiceEnabled}
      onToggleVoice={handleToggleVoice}
      onReload={handleReload}
      onOpenSettings={handleOpenSettings}
    />
  );
}
