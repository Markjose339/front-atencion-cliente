"use client";

import { useMemo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  formatAuditDateTime,
  formatAuditUserLabel,
  humanizeAuditToken,
  useAuditLogDetailQuery,
} from "@/hooks/use-audit";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type AuditDetailSheetProps = {
  auditId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DiffStatus = "added" | "removed" | "changed" | "unchanged";

type DiffRow = {
  key: string;
  status: DiffStatus;
  oldValue: unknown;
  newValue: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeForCompare = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForCompare(item));
  }

  if (isRecord(value)) {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right, "es"))
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = normalizeForCompare(value[key]);
        return accumulator;
      }, {});
  }

  return value;
};

const toComparableString = (value: unknown): string => {
  if (value === undefined) {
    return "undefined";
  }

  try {
    return JSON.stringify(normalizeForCompare(value));
  } catch {
    return String(value);
  }
};

const isSameValue = (left: unknown, right: unknown): boolean =>
  toComparableString(left) === toComparableString(right);

const toPrettyJson = (value: unknown): string => {
  if (value === undefined) {
    return "undefined";
  }

  try {
    const normalizedValue = normalizeForCompare(value);
    return JSON.stringify(normalizedValue, null, 2) ?? "null";
  } catch {
    return String(value);
  }
};

const buildDiffRows = (
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
): DiffRow[] => {
  const normalizedOldValues = oldValues ?? {};
  const normalizedNewValues = newValues ?? {};

  const allKeys = Array.from(
    new Set([...Object.keys(normalizedOldValues), ...Object.keys(normalizedNewValues)]),
  ).sort((left, right) => left.localeCompare(right, "es"));

  return allKeys.map((key) => {
    const hasOldValue = Object.prototype.hasOwnProperty.call(normalizedOldValues, key);
    const hasNewValue = Object.prototype.hasOwnProperty.call(normalizedNewValues, key);
    const oldValue = normalizedOldValues[key];
    const newValue = normalizedNewValues[key];

    let status: DiffStatus = "unchanged";
    if (!hasOldValue && hasNewValue) {
      status = "added";
    } else if (hasOldValue && !hasNewValue) {
      status = "removed";
    } else if (!isSameValue(oldValue, newValue)) {
      status = "changed";
    }

    return {
      key,
      status,
      oldValue: hasOldValue ? oldValue : undefined,
      newValue: hasNewValue ? newValue : undefined,
    };
  });
};

const DIFF_STATUS_LABELS: Record<DiffStatus, string> = {
  added: "Agregado",
  removed: "Eliminado",
  changed: "Cambiado",
  unchanged: "Sin cambios",
};

const DIFF_STATUS_STYLES: Record<DiffStatus, string> = {
  added: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-800/70 dark:bg-emerald-950/20",
  removed: "border-rose-200/70 bg-rose-50/60 dark:border-rose-800/70 dark:bg-rose-950/20",
  changed: "border-amber-200/70 bg-amber-50/60 dark:border-amber-800/70 dark:bg-amber-950/20",
  unchanged: "border-border bg-background",
};

const DIFF_BADGE_VARIANTS: Record<DiffStatus, "default" | "secondary" | "outline"> = {
  added: "default",
  removed: "outline",
  changed: "secondary",
  unchanged: "outline",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm break-all">{value}</p>
    </div>
  );
}

function JsonCard({
  title,
  value,
  muted = false,
}: {
  title: string;
  value: unknown;
  muted?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-muted/20 p-3",
        muted ? "opacity-60" : undefined,
      )}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <pre className="max-h-56 overflow-auto rounded-md border bg-background p-2 text-xs whitespace-pre-wrap break-words">
        {toPrettyJson(value)}
      </pre>
    </article>
  );
}

export function AuditDetailSheet({ auditId, open, onOpenChange }: AuditDetailSheetProps) {
  const { findAuditLogById } = useAuditLogDetailQuery(auditId, open);
  const { data, isLoading, isFetching, error, refetch } = findAuditLogById;

  const changedFields = useMemo(
    () =>
      buildDiffRows(data?.oldValues ?? null, data?.newValues ?? null).filter(
        (row) => row.status !== "unchanged",
      ),
    [data?.oldValues, data?.newValues],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-3xl">
        <SheetHeader className="border-b">
          <SheetTitle>Detalle de auditoria</SheetTitle>
          <SheetDescription>
            {auditId ? `Evento ${auditId}` : "Selecciona un evento para ver sus detalles"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Cargando detalle...</p>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-medium">
                No se pudo cargar el detalle del evento seleccionado.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : null}

          {!isLoading && !error && data ? (
            <>
              {isFetching ? (
                <p className="text-xs text-muted-foreground">Actualizando detalle...</p>
              ) : null}

              <section className="space-y-4 rounded-lg border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{humanizeAuditToken(data.action)}</Badge>
                  <Badge variant="outline">{humanizeAuditToken(data.auditableType)}</Badge>
                  {data.auditableId ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {data.auditableId}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Fecha/Hora" value={formatAuditDateTime(data.createdAt)} />
                  <InfoRow label="Usuario" value={formatAuditUserLabel(data.user)} />
                  <InfoRow
                    label="Correo"
                    value={data.user?.email?.trim() || "Sin correo registrado"}
                  />
                  <InfoRow label="IP" value={data.ipAddress?.trim() || "Sin IP"} />
                  <InfoRow
                    label="Descripcion"
                    value={data.description?.trim() || "Sin descripcion registrada"}
                  />
                  <InfoRow label="User Agent" value={data.userAgent?.trim() || "Sin user agent"} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Valores JSON</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <JsonCard title="oldValues" value={data.oldValues} />
                  <JsonCard title="newValues" value={data.newValues} />
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Cambios detectados</h3>
                {changedFields.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                    No se detectaron cambios entre oldValues y newValues.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {changedFields.map((field) => (
                      <article
                        key={field.key}
                        className={cn(
                          "rounded-lg border p-3 space-y-3",
                          DIFF_STATUS_STYLES[field.status],
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-xs sm:text-sm">{field.key}</p>
                          <Badge variant={DIFF_BADGE_VARIANTS[field.status]}>
                            {DIFF_STATUS_LABELS[field.status]}
                          </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <JsonCard
                            title="Anterior"
                            value={field.oldValue}
                            muted={field.status === "added"}
                          />
                          <JsonCard
                            title="Nuevo"
                            value={field.newValue}
                            muted={field.status === "removed"}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
