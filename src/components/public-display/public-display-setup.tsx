"use client";

import { Building2, CheckCircle2, Loader2, Save, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PublicBranch, PublicService } from "@/types/public";

type PublicDisplaySetupProps = {
  branches: PublicBranch[];
  services: PublicService[];
  loadingBranches: boolean;
  loadingServices: boolean;
  selectedBranchId: string;
  selectedServiceIds: string[];
  onSelectBranch: (branchId: string) => void;
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
  onSelectBranch,
  onToggleService,
  onSaveConfiguration,
}: PublicDisplaySetupProps) {
  const canSave = selectedBranchId.length > 0 && selectedServiceIds.length > 0;

  return (
    <main className="h-dvh w-full overflow-auto bg-[#f4f8ff] px-4 py-6 text-[#0C3E63] sm:px-6 sm:py-8 dark:bg-[#0C3E63] dark:text-[#e8f2ff]">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border-2 border-[#20539A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#eef5ff_52%,#fff5d8_100%)] p-6 shadow-[0_28px_48px_-34px_rgba(12,62,99,0.7)] dark:border-[#5d7fa8]/60 dark:bg-[linear-gradient(145deg,#16385f_0%,#123c63_56%,#1c375c_100%)] dark:shadow-[0_30px_50px_-34px_rgba(0,0,0,0.82)] sm:p-8">
          <header className="mb-6 border-b border-[#20539A]/25 pb-5 dark:border-[#5f82ac]/45">
            <h1 className="text-2xl font-bold sm:text-3xl">Configurar pantalla publica</h1>
            <p className="mt-2 text-sm text-[#20539A] dark:text-[#b9d0ee] sm:text-base">
              Seleccione una sucursal y los servicios que esta pantalla debe mostrar.
            </p>
          </header>

          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#114591] dark:text-[#FDCB35]">
                1) Sucursal
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                          "h-full rounded-2xl border p-4 transition",
                          selected
                            ? "border-[#114591] bg-[#edf4ff] shadow-[0_18px_28px_-24px_rgba(12,62,99,0.9)] dark:border-[#87aadd] dark:bg-[#1c456f]"
                            : "border-[#20539A]/25 bg-white/85 hover:border-[#20539A]/50 dark:border-[#587ca7]/55 dark:bg-[#194068]/75",
                        )}
                      >
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Building2 className="h-4 w-4" />
                          {branch.name}
                        </p>
                        <p className="mt-1 text-xs text-[#20539A] dark:text-[#bdd2ee]">
                          {branch.departmentName}
                        </p>
                      </Card>
                    </button>
                  );
                })}
              </div>

              {loadingBranches ? (
                <p className="text-sm text-[#20539A] dark:text-[#bdd2ee]">Cargando sucursales...</p>
              ) : null}

              {!loadingBranches && branches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#20539A]/35 bg-white/70 p-5 text-sm text-[#20539A] dark:border-[#5b7da6]/55 dark:bg-[#194068]/70 dark:text-[#c8daf2]">
                  No hay sucursales disponibles.
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#114591] dark:text-[#FDCB35]">
                2) Servicios visibles
              </h2>

              {selectedBranchId ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {services.map((service) => {
                    const selected = isServiceSelected(service.serviceId, selectedServiceIds);

                    return (
                      <label
                        key={service.serviceId}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                          selected
                            ? "border-[#114591] bg-[#edf4ff] dark:border-[#87aadd] dark:bg-[#1c456f]"
                            : "border-[#20539A]/25 bg-white/80 hover:border-[#20539A]/50 dark:border-[#587ca7]/55 dark:bg-[#194068]/72",
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
                          <p className="mt-1 text-xs uppercase tracking-[0.06em] text-[#20539A] dark:text-[#c3d7f1]">
                            {service.abbreviation} - {service.serviceCode}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#20539A]/35 bg-white/70 p-5 text-sm text-[#20539A] dark:border-[#5b7da6]/55 dark:bg-[#194068]/70 dark:text-[#c8daf2]">
                  Primero seleccione una sucursal para cargar sus servicios.
                </div>
              )}

              {loadingServices ? (
                <p className="inline-flex items-center gap-2 text-sm text-[#20539A] dark:text-[#bdd2ee]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando servicios...
                </p>
              ) : null}

              {selectedBranchId && !loadingServices && services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#20539A]/35 bg-white/70 p-5 text-sm text-[#20539A] dark:border-[#5b7da6]/55 dark:bg-[#194068]/70 dark:text-[#c8daf2]">
                  No hay servicios activos para esta sucursal.
                </div>
              ) : null}
            </div>
          </div>

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#20539A]/25 pt-5 dark:border-[#5f82ac]/45">
            <p className="text-sm text-[#20539A] dark:text-[#bed3ef]">
              Servicios seleccionados: <strong>{selectedServiceIds.length}</strong>
            </p>

            <Button
              type="button"
              className="h-11 rounded-xl bg-[#114591] px-6 text-white hover:bg-[#0C3E63] dark:bg-[#FDCB35] dark:text-[#0C3E63] dark:hover:bg-[#F0E049]"
              onClick={onSaveConfiguration}
              disabled={!canSave}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar configuracion
            </Button>
          </footer>

          {!canSave ? (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#20539A] dark:text-[#c3d8f2]">
              <CheckCircle2 className="h-4 w-4" />
              Debe elegir sucursal y al menos un servicio.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
