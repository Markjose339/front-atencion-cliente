"use client";

import { Building2, CheckCircle2, ChevronLeft, Loader2, Save, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PublicBranch, PublicService } from "@/types/public";

export type PublicDisplaySetupStep = "branch" | "services";

type PublicDisplaySetupProps = {
  branches: PublicBranch[];
  services: PublicService[];
  loadingBranches: boolean;
  loadingServices: boolean;
  selectedBranchId: string;
  selectedServiceIds: string[];
  step: PublicDisplaySetupStep;
  onSelectBranch: (branchId: string) => void;
  onBackToBranches: () => void;
  onToggleService: (serviceId: string) => void;
  onSaveConfiguration: () => void;
};

const isServiceSelected = (serviceId: string, selectedServiceIds: string[]): boolean =>
  selectedServiceIds.includes(serviceId);

export function PublicDisplaySetup({
  branches,
  services,
  loadingBranches,
  loadingServices,
  selectedBranchId,
  selectedServiceIds,
  step,
  onSelectBranch,
  onBackToBranches,
  onToggleService,
  onSaveConfiguration,
}: PublicDisplaySetupProps) {
  const canSave = selectedBranchId.length > 0 && selectedServiceIds.length > 0;
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Configuracion de pantalla</h2>
          <p className="text-sm text-muted-foreground">
            Seleccione sucursal y servicios para mostrar los tickets llamados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={step === "branch" ? "default" : "secondary"}>1. Sucursal</Badge>
          <Badge variant={step === "services" ? "default" : "secondary"}>2. Servicios</Badge>
        </div>
      </header>

      {step === "branch" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {branches.map((branch) => {
              const selected = branch.id === selectedBranchId;

              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => onSelectBranch(branch.id)}
                  className="text-left"
                  disabled={loadingBranches}
                >
                  <Card
                    className={cn(
                      "h-full rounded-xl border p-4 transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/60",
                    )}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4" />
                      {branch.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{branch.departmentName}</p>
                  </Card>
                </button>
              );
            })}
          </div>

          {loadingBranches ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando sucursales...
            </p>
          ) : null}

          {!loadingBranches && branches.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No hay sucursales disponibles.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Sucursal seleccionada</p>
              <p className="text-sm font-semibold">{selectedBranch?.name ?? "Sin sucursal"}</p>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={onBackToBranches}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Cambiar
            </Button>
          </div>

          <div className="space-y-3">
            {selectedBranchId ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const selected = isServiceSelected(service.serviceId, selectedServiceIds);

                  return (
                    <label
                      key={service.serviceId}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/60",
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onToggleService(service.serviceId)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <ShieldCheck className="h-4 w-4" />
                          {service.serviceName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.06em] text-muted-foreground">
                          {service.abbreviation} - {service.serviceCode}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Primero seleccione una sucursal para cargar sus servicios.
              </div>
            )}

            {loadingServices ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando servicios...
              </p>
            ) : null}

            {selectedBranchId && !loadingServices && services.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No hay servicios activos para esta sucursal.
              </div>
            ) : null}
          </div>

          <footer className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Servicios seleccionados: <strong>{selectedServiceIds.length}</strong>
              </p>

              <Button type="button" onClick={onSaveConfiguration} disabled={!canSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar configuracion
              </Button>
            </div>

            {!canSave ? (
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Debe elegir al menos un servicio.
              </p>
            ) : null}
          </footer>
        </div>
      )}
    </section>
  );
}
