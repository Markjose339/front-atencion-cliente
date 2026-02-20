"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, PlusCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useBranchesQuery } from "@/hooks/use-branches";
import {
  useBranchAssignmentsConfigQuery,
  useOperatorsSyncMutation,
  useWindowServicesSyncMutation,
} from "@/hooks/use-assignments";
import {
  OperatorsSyncPayload,
  WindowServicesSyncPayload,
} from "@/types/assignment";

import { Protected } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PaginatedCommandSelect,
  PaginatedItem,
} from "@/components/ui/paginated-command-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EditableWindowServices = {
  windowId: string;
  windowName: string;
  windowCode: string;
  serviceIds: string[];
};

type EditableOperatorAssignment = {
  localId: string;
  userId: string;
  windowId: string;
  isActive: boolean;
};

type ConfigBlock = "services" | "operators";

const ITEMS_PER_PAGE = 10;

const getErrorText = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "Error desconocido";
  }

  const current = error as Record<string, unknown>;

  if (typeof current.message === "string") {
    return current.message;
  }

  if (current.message && typeof current.message === "object") {
    const nested = current.message as Record<string, unknown>;

    if (typeof nested.message === "string") {
      return nested.message;
    }

    if (typeof nested.error === "string") {
      return nested.error;
    }
  }

  return "Error desconocido";
};

const uniqueIds = (ids: string[]): string[] => Array.from(new Set(ids.filter(Boolean)));

const buildWindowServicesSyncPayload = (
  branchId: string,
  rows: EditableWindowServices[],
): WindowServicesSyncPayload => ({
  branchId,
  windowServices: rows.map((row) => ({
    windowId: row.windowId,
    serviceIds: uniqueIds(row.serviceIds),
  })),
});

const buildOperatorsSyncPayload = (
  branchId: string,
  rows: EditableOperatorAssignment[],
): OperatorsSyncPayload => ({
  branchId,
  assignments: rows.map((row) => ({
    userId: row.userId,
    windowId: row.windowId,
    isActive: row.isActive,
  })),
});

const buildSummaryText = <TSummary extends object>(summary: TSummary): string =>
  Object.entries(summary)
    .map(([key, value]) => `${key}: ${Number(value)}`)
    .join(" | ");

const createLocalId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function AssignmentBranchConfig() {
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [activeBlock, setActiveBlock] = useState<ConfigBlock>("services");

  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesSearch, setBranchesSearch] = useState("");

  const [windowServicesDraft, setWindowServicesDraft] = useState<EditableWindowServices[] | null>(null);
  const [operatorAssignmentsDraft, setOperatorAssignmentsDraft] = useState<
    EditableOperatorAssignment[] | null
  >(null);

  const [serviceSaveError, setServiceSaveError] = useState<string | null>(null);
  const [operatorSaveError, setOperatorSaveError] = useState<string | null>(null);

  const { findAllBranches } = useBranchesQuery({
    page: branchesPage,
    limit: ITEMS_PER_PAGE,
    search: branchesSearch,
  });
  const { findBranchConfig } = useBranchAssignmentsConfigQuery(selectedBranchId);

  const { sync: syncWindowServices } = useWindowServicesSyncMutation();
  const { sync: syncOperators } = useOperatorsSyncMutation();

  const config = findBranchConfig.data;

  const branchOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllBranches.data?.data.map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? []
    );
  }, [findAllBranches.data]);

  const defaultWindowServicesRows = useMemo<EditableWindowServices[]>(() => {
    if (!config) return [];

    return config.windows.map(({ window, serviceIds }) => ({
      windowId: window.id,
      windowName: window.name,
      windowCode: window.code,
      serviceIds: uniqueIds(serviceIds),
    }));
  }, [config]);

  const defaultOperatorRows = useMemo<EditableOperatorAssignment[]>(() => {
    if (!config) return [];

    return config.operatorAssignments.map((assignment) => ({
      localId: assignment.id,
      userId: assignment.user.id,
      windowId: assignment.window.id,
      isActive: assignment.isActive,
    }));
  }, [config]);

  const windowServicesRows = windowServicesDraft ?? defaultWindowServicesRows;
  const operatorRows = operatorAssignmentsDraft ?? defaultOperatorRows;

  const availableServices = config?.services ?? [];

  const windowsForOperators = useMemo(() => {
    if (!config) return [];

    const byId = new Map(config.windows.map(({ window }) => [window.id, window]));
    return Array.from(byId.values());
  }, [config]);

  const operatorsCatalog = useMemo(() => {
    if (!config) return [];

    const byId = new Map(config.operatorsCatalog.map((operator) => [operator.id, operator]));
    for (const assignment of config.operatorAssignments) {
      if (!byId.has(assignment.user.id)) {
        byId.set(assignment.user.id, {
          id: assignment.user.id,
          name: assignment.user.name,
          email: assignment.user.email,
        });
      }
    }

    return Array.from(byId.values());
  }, [config]);

  const operatorById = useMemo(
    () => new Map(operatorsCatalog.map((operator) => [operator.id, operator])),
    [operatorsCatalog],
  );

  const duplicateOperatorIds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of operatorRows) {
      if (!row.userId) continue;
      counts.set(row.userId, (counts.get(row.userId) ?? 0) + 1);
    }

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([userId]) => userId),
    );
  }, [operatorRows]);

  const duplicateOperatorNames = useMemo(() => {
    return Array.from(duplicateOperatorIds)
      .map((userId) => operatorById.get(userId)?.name ?? userId)
      .join(", ");
  }, [duplicateOperatorIds, operatorById]);

  const hasIncompleteOperatorRows = operatorRows.some((row) => !row.userId || !row.windowId);

  const toggleServiceInWindow = (windowId: string, serviceId: string, checked: boolean) => {
    setWindowServicesDraft((currentRows) => {
      const baseRows = currentRows ?? defaultWindowServicesRows;

      return baseRows.map((row) => {
        if (row.windowId !== windowId) {
          return row;
        }

        const currentIds = new Set(row.serviceIds);
        if (checked) {
          currentIds.add(serviceId);
        } else {
          currentIds.delete(serviceId);
        }

        return {
          ...row,
          serviceIds: Array.from(currentIds),
        };
      });
    });

    setServiceSaveError(null);
  };

  const updateOperatorRow = (
    rowId: string,
    patch: Partial<Pick<EditableOperatorAssignment, "userId" | "windowId" | "isActive">>,
  ) => {
    setOperatorAssignmentsDraft((currentRows) => {
      const baseRows = currentRows ?? defaultOperatorRows;
      return baseRows.map((row) => (row.localId === rowId ? { ...row, ...patch } : row));
    });
    setOperatorSaveError(null);
  };

  const removeOperatorRow = (rowId: string) => {
    setOperatorAssignmentsDraft((currentRows) => {
      const baseRows = currentRows ?? defaultOperatorRows;
      return baseRows.filter((row) => row.localId !== rowId);
    });
    setOperatorSaveError(null);
  };

  const handleAddOperatorRow = () => {
    const selectedOperatorIds = new Set(operatorRows.map((row) => row.userId).filter(Boolean));
    const firstAvailableOperator = operatorsCatalog.find(
      (operator) => !selectedOperatorIds.has(operator.id),
    );
    const firstWindow = windowsForOperators[0];

    if (!firstAvailableOperator || !firstWindow) return;

    setOperatorAssignmentsDraft((currentRows) => {
      const baseRows = currentRows ?? defaultOperatorRows;
      return [
        ...baseRows,
        {
          localId: createLocalId(),
          userId: firstAvailableOperator.id,
          windowId: firstWindow.id,
          isActive: true,
        },
      ];
    });
    setOperatorSaveError(null);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveBlock("services");
    setWindowServicesDraft(null);
    setOperatorAssignmentsDraft(null);
    setServiceSaveError(null);
    setOperatorSaveError(null);
  };

  const saveWindowServices = async () => {
    if (!selectedBranchId) return;

    setServiceSaveError(null);
    const payload = buildWindowServicesSyncPayload(selectedBranchId, windowServicesRows);

    try {
      const response = await syncWindowServices.mutateAsync(payload);
      toast.success(`Servicios sincronizados. ${buildSummaryText(response.summary)}`);
      await findBranchConfig.refetch();
      setWindowServicesDraft(null);
    } catch (error) {
      const message = getErrorText(error);
      setServiceSaveError(message);
      toast.error(message);
    }
  };

  const saveOperatorAssignments = async () => {
    if (!selectedBranchId) return;

    if (duplicateOperatorIds.size > 0) {
      setOperatorSaveError("No puedes repetir operadores en distintas filas.");
      toast.error("No puedes repetir operadores en distintas filas.");
      return;
    }

    if (hasIncompleteOperatorRows) {
      setOperatorSaveError("Completa operador y ventanilla en todas las filas.");
      toast.error("Completa operador y ventanilla en todas las filas.");
      return;
    }

    setOperatorSaveError(null);
    const payload = buildOperatorsSyncPayload(selectedBranchId, operatorRows);

    try {
      const response = await syncOperators.mutateAsync(payload);
      toast.success(`Operadores sincronizados. ${buildSummaryText(response.summary)}`);
      await findBranchConfig.refetch();
      setOperatorAssignmentsDraft(null);
    } catch (error) {
      const message = getErrorText(error);
      setOperatorSaveError(message);
      toast.error(message);
    }
  };

  const saveServicesDisabled =
    !selectedBranchId || !config || syncWindowServices.isPending || findBranchConfig.isLoading;
  const saveOperatorsDisabled =
    !selectedBranchId ||
    !config ||
    syncOperators.isPending ||
    findBranchConfig.isLoading ||
    duplicateOperatorIds.size > 0 ||
    hasIncompleteOperatorRows;

  const operatorsRemaining = operatorsCatalog.length - new Set(
    operatorRows.map((row) => row.userId).filter(Boolean),
  ).size;

  return (
    <section className="rounded-xl border bg-background shadow-sm space-y-4 p-3 sm:p-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Configuracion por sucursal</h2>
          <p className="text-sm text-muted-foreground">
            Carga la configuracion completa de una sucursal y guarda cambios por bloque.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Sucursal</p>
          <PaginatedCommandSelect
            items={branchOptions}
            value={selectedBranchId}
            placeholder="Selecciona una sucursal"
            search={branchesSearch}
            page={branchesPage}
            totalPages={findAllBranches.data?.meta.totalPages ?? 1}
            isLoading={findAllBranches.isLoading}
            onChange={handleBranchChange}
            onSearchChange={(value) => {
              setBranchesSearch(value);
              setBranchesPage(1);
            }}
            onPageChange={setBranchesPage}
          />
        </div>
      </div>

      {!selectedBranchId ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Selecciona una sucursal para editar servicios y operadores por ventanilla.
        </div>
      ) : null}

      {selectedBranchId && findBranchConfig.isLoading && !config ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Cargando configuracion de la sucursal...
        </div>
      ) : null}

      {selectedBranchId && findBranchConfig.error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-red-500 space-y-4 rounded-lg border">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">
            No se pudo cargar la configuracion: {getErrorText(findBranchConfig.error)}
          </p>
          <Button variant="outline" onClick={() => findBranchConfig.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : null}

      {selectedBranchId && config ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sucursal seleccionada</p>
              <p className="font-semibold">
                {config.branch.name}
                {findBranchConfig.isFetching ? (
                  <span className="ml-2 inline-flex items-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Actualizando...
                  </span>
                ) : null}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border p-1">
              <Button
                type="button"
                size="sm"
                variant={activeBlock === "services" ? "secondary" : "ghost"}
                onClick={() => setActiveBlock("services")}
              >
                Servicios por ventanilla
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeBlock === "operators" ? "secondary" : "ghost"}
                onClick={() => setActiveBlock("operators")}
              >
                Operadores por ventanilla
              </Button>
            </div>
          </div>

          {activeBlock === "services" ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Servicios por ventanilla</h3>
                  <p className="text-sm text-muted-foreground">
                    Marca o desmarca servicios por cada ventanilla y guarda en lote.
                  </p>
                </div>

                <Protected permissions={["crear asignaciones", "editar asignaciones"]}>
                  <Button onClick={saveWindowServices} disabled={saveServicesDisabled}>
                    {syncWindowServices.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar servicios
                  </Button>
                </Protected>
              </div>

              {serviceSaveError ? (
                <p className="text-sm text-destructive">{serviceSaveError}</p>
              ) : null}

              {windowServicesRows.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Esta sucursal no tiene ventanillas para configurar.
                </div>
              ) : availableServices.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No hay servicios disponibles para asignar en esta sucursal.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Ventanilla</TableHead>
                      {availableServices.map((service) => (
                        <TableHead key={service.id} className="min-w-[140px] text-center">
                          <div className="flex flex-col">
                            <span>{service.code}</span>
                            <span className="text-xs text-muted-foreground">
                              {service.abbreviation || service.name}
                            </span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {windowServicesRows.map((row) => (
                      <TableRow key={row.windowId}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{row.windowName}</span>
                            <span className="text-xs text-muted-foreground">{row.windowCode}</span>
                          </div>
                        </TableCell>

                        {availableServices.map((service) => {
                          const checked = row.serviceIds.includes(service.id);
                          return (
                            <TableCell key={`${row.windowId}:${service.id}`} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) =>
                                    toggleServiceInWindow(row.windowId, service.id, value === true)
                                  }
                                  disabled={syncWindowServices.isPending}
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Operadores por ventanilla</h3>
                  <p className="text-sm text-muted-foreground">
                    Administra el mapeo operador a ventanilla y sincroniza en lote.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Protected permissions={["crear asignaciones", "editar asignaciones"]}>
                    <Button
                      variant="outline"
                      onClick={handleAddOperatorRow}
                      disabled={
                        syncOperators.isPending ||
                        windowsForOperators.length === 0 ||
                        operatorsCatalog.length === 0 ||
                        operatorsRemaining <= 0
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar operador
                    </Button>
                  </Protected>

                  <Protected permissions={["crear asignaciones", "editar asignaciones"]}>
                    <Button onClick={saveOperatorAssignments} disabled={saveOperatorsDisabled}>
                      {syncOperators.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar operadores
                    </Button>
                  </Protected>
                </div>
              </div>

              {operatorSaveError ? (
                <p className="text-sm text-destructive">{operatorSaveError}</p>
              ) : null}

              {duplicateOperatorIds.size > 0 ? (
                <p className="text-sm text-destructive">
                  Operadores duplicados: {duplicateOperatorNames}
                </p>
              ) : null}

              {operatorRows.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Sin asignaciones de operador. Puedes guardar vacio para limpiar todo.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[42%]">Operador</TableHead>
                      <TableHead className="w-[38%]">Ventanilla</TableHead>
                      <TableHead className="w-[10%] text-center">Activo</TableHead>
                      <TableHead className="w-[10%] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {operatorRows.map((row) => (
                      <TableRow key={row.localId}>
                        <TableCell>
                          <Select
                            value={row.userId}
                            onValueChange={(userId) => updateOperatorRow(row.localId, { userId })}
                            disabled={syncOperators.isPending}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona operador" />
                            </SelectTrigger>
                            <SelectContent align="start">
                              {operatorsCatalog.map((operator) => {
                                const selectedByOtherRow = operatorRows.some(
                                  (candidate) =>
                                    candidate.localId !== row.localId &&
                                    candidate.userId === operator.id,
                                );

                                return (
                                  <SelectItem
                                    key={operator.id}
                                    value={operator.id}
                                    disabled={selectedByOtherRow}
                                  >
                                    {operator.name} ({operator.email})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Select
                            value={row.windowId}
                            onValueChange={(windowId) => updateOperatorRow(row.localId, { windowId })}
                            disabled={syncOperators.isPending}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona ventanilla" />
                            </SelectTrigger>
                            <SelectContent align="start">
                              {windowsForOperators.map((window) => (
                                <SelectItem key={window.id} value={window.id}>
                                  {window.name} ({window.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={row.isActive}
                              onCheckedChange={(value) =>
                                updateOperatorRow(row.localId, { isActive: value === true })
                              }
                              disabled={syncOperators.isPending}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeOperatorRow(row.localId)}
                            disabled={syncOperators.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Eliminar fila</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
