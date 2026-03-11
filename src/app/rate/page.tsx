"use client";

import {
  AlertCircle,
  Angry,
  CircleCheckBig,
  Frown,
  Laugh,
  Loader2,
  Meh,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomerServiceWindows } from "@/hooks/use-customer-service";
import { useSocket } from "@/hooks/use-socket";
import { useTicketRatingsMutation } from "@/hooks/use-ticket-ratings";
import { extractApiErrorMessage } from "@/lib/api-error";
import {
  ticketRatingSocketPayloadSchema,
  TicketRatingRealtimeStateSchemaType,
  TicketRatingSocketPayloadSchemaType,
} from "@/lib/schemas/ticket-rating.schema";
import { cn } from "@/lib/utils";
import { TicketRatingRealtimeState } from "@/types/ticket-rating";

type FaceOption = {
  score: number;
  label: string;
  icon: LucideIcon;
  colorClassName: string;
};

type LiveTicketState = {
  scopeKey: string;
  ticket: TicketRatingRealtimeState | null;
};

const FACE_OPTIONS: FaceOption[] = [
  { score: 1, label: "Muy malo", icon: Angry, colorClassName: "text-red-600" },
  { score: 2, label: "Malo", icon: Frown, colorClassName: "text-orange-500" },
  { score: 3, label: "Regular", icon: Meh, colorClassName: "text-amber-500" },
  { score: 4, label: "Bueno", icon: Smile, colorClassName: "text-lime-600" },
  { score: 5, label: "Excelente", icon: Laugh, colorClassName: "text-emerald-600" },
];

const THANK_YOU_DURATION_MS = 2800;

const normalizeScopeValue = (value: string | null): string => (value ?? "").trim();

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const unwrapUnknownSocketPayload = (payload: unknown): Record<string, unknown> | null => {
  const source = asRecord(payload);
  if (!source) return null;

  if (source.ticket) {
    const ticket = asRecord(source.ticket);
    if (ticket) return ticket;
  }

  if (source.data) {
    const data = asRecord(source.data);
    if (data) return data;
  }

  return source;
};

const isExplicitNoTicketPayload = (payload: unknown): boolean => {
  if (payload === null) return true;

  const source = unwrapUnknownSocketPayload(payload);
  if (!source) return false;

  if ("ticket" in source && source.ticket === null) return true;
  if ("data" in source && source.data === null) return true;
  if (!("ticketId" in source)) return false;

  const ticketId = source.ticketId;
  if (ticketId === null || ticketId === undefined) return true;
  if (typeof ticketId === "string" && ticketId.trim().length === 0) return true;

  return false;
};

const unwrapTypedSocketPayload = (
  payload: TicketRatingSocketPayloadSchemaType,
): TicketRatingRealtimeStateSchemaType => {
  if ("ticket" in payload) return payload.ticket;
  if ("data" in payload) return payload.data;
  return payload;
};

const parseTicketRealtimeState = (payload: unknown): TicketRatingRealtimeState | null => {
  const parsed = ticketRatingSocketPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;

  const source = unwrapTypedSocketPayload(parsed.data);

  return {
    ticketId: source.ticketId,
    code: source.code || source.ticketId,
    status: source.status,
    windowId: source.windowId,
    canRate: source.canRate,
    isPaused: source.isPaused,
    isRated: source.isRated,
    rating: source.rating,
  };
};

export default function RatePage() {
  const searchParams = useSearchParams();
  const { socket } = useSocket();
  const { windowsQuery } = useCustomerServiceWindows();
  const { createTicketRating } = useTicketRatingsMutation();

  const queryBranchId = normalizeScopeValue(searchParams.get("branchId"));
  const queryWindowId = normalizeScopeValue(searchParams.get("windowId"));
  const hasPartialScopeInQuery = Boolean(queryBranchId) !== Boolean(queryWindowId);

  const fallbackWindow = useMemo(() => {
    if (queryBranchId || queryWindowId) return null;

    const options = windowsQuery.data ?? [];
    if (options.length !== 1) return null;

    return options[0];
  }, [queryBranchId, queryWindowId, windowsQuery.data]);

  const branchId = queryBranchId || fallbackWindow?.branchId || "";
  const windowId = queryWindowId || fallbackWindow?.windowId || "";
  const scopeKey = `${branchId}:${windowId}`;
  const hasScope = branchId.length > 0 && windowId.length > 0;

  const waitingForScopeFallback =
    !hasScope &&
    !hasPartialScopeInQuery &&
    !queryBranchId &&
    !queryWindowId &&
    windowsQuery.isLoading;

  const [liveTicketState, setLiveTicketState] = useState<LiveTicketState | null>(null);
  const [scoreSelection, setScoreSelection] = useState<{ ticketId: string; score: number } | null>(
    null,
  );
  const [thankYouState, setThankYouState] = useState<{ scopeKey: string; ticketId: string } | null>(
    null,
  );
  const submittingRef = useRef(false);
  const thankYouTimerRef = useRef<number | null>(null);

  const ticketState = useMemo(() => {
    if (!liveTicketState) return null;
    if (liveTicketState.scopeKey !== scopeKey) return null;
    return liveTicketState.ticket;
  }, [liveTicketState, scopeKey]);

  const selectedScore = useMemo(() => {
    if (!ticketState) return null;

    if (ticketState.isRated) {
      return ticketState.rating ?? null;
    }

    if (scoreSelection?.ticketId === ticketState.ticketId) {
      return scoreSelection.score;
    }

    return null;
  }, [ticketState, scoreSelection]);

  const clearThankYouTimer = useCallback(() => {
    if (thankYouTimerRef.current === null) return;
    window.clearTimeout(thankYouTimerRef.current);
    thankYouTimerRef.current = null;
  }, []);

  const triggerThankYouFlow = useCallback(
    (ticketId: string) => {
      clearThankYouTimer();

      setThankYouState({ scopeKey, ticketId });
      setScoreSelection(null);
      setLiveTicketState((previous) => {
        if (!previous || previous.scopeKey !== scopeKey) return previous;
        return { scopeKey, ticket: null };
      });

      thankYouTimerRef.current = window.setTimeout(() => {
        setThankYouState((previous) => {
          if (!previous) return previous;
          if (previous.scopeKey !== scopeKey || previous.ticketId !== ticketId) return previous;
          return null;
        });
        thankYouTimerRef.current = null;
      }, THANK_YOU_DURATION_MS);
    },
    [clearThankYouTimer, scopeKey],
  );

  useEffect(() => {
    return () => {
      clearThankYouTimer();
    };
  }, [clearThankYouTimer]);

  const applyIncomingTicketState = useCallback(
    (payload: unknown) => {
      const parsedState = parseTicketRealtimeState(payload);

      if (!parsedState) {
        if (isExplicitNoTicketPayload(payload)) {
          setLiveTicketState({
            scopeKey,
            ticket: null,
          });
        }
        return;
      }

      if (parsedState.windowId && parsedState.windowId !== windowId) {
        return;
      }

      setLiveTicketState({
        scopeKey,
        ticket: parsedState,
      });
    },
    [scopeKey, windowId],
  );

  useEffect(() => {
    if (!socket || !hasScope) return;

    const joinPayload = { branchId, windowId };

    const joinRateRoom = () => {
      socket.emit("rate:join", joinPayload, (ackPayload?: unknown) => {
        if (ackPayload === undefined) return;
        applyIncomingTicketState(ackPayload);
      });
    };

    const handleTicketState = (payload: unknown) => {
      applyIncomingTicketState(payload);
    };

    const handleTicketRated = (payload: unknown) => {
      applyIncomingTicketState(payload);
    };

    joinRateRoom();
    socket.on("connect", joinRateRoom);
    socket.on("rate:ticket-state", handleTicketState);
    socket.on("rate:ticket-rated", handleTicketRated);

    return () => {
      socket.off("connect", joinRateRoom);
      socket.off("rate:ticket-state", handleTicketState);
      socket.off("rate:ticket-rated", handleTicketRated);
    };
  }, [socket, hasScope, branchId, windowId, applyIncomingTicketState]);

  const canRateTicket = Boolean(
    ticketState &&
      ticketState.status === "FINALIZADO" &&
      !ticketState.isRated &&
      ticketState.canRate,
  );
  const showThankYouMessage = Boolean(thankYouState && thankYouState.scopeKey === scopeKey);
  const showRatingOnly = canRateTicket && !showThankYouMessage;
  const showTicketAndStatusCards = !showRatingOnly && !showThankYouMessage;

  const isSubmitting = createTicketRating.isPending;
  const disableScoreSelection = !canRateTicket || isSubmitting;

  const submitScore = useCallback(
    async (score: number) => {
      if (!ticketState) return;
      if (ticketState.isRated) return;
      if (!canRateTicket) return;
      if (isSubmitting) return;
      if (submittingRef.current) return;

      const ticketId = ticketState.ticketId;
      submittingRef.current = true;
      setScoreSelection({ ticketId, score });

      try {
        await createTicketRating.mutateAsync({ ticketId, score });
        triggerThankYouFlow(ticketId);
      } catch (error) {
        toast.error(extractApiErrorMessage(error, "No se pudo enviar la calificacion"));
      } finally {
        submittingRef.current = false;
      }
    },
    [ticketState, canRateTicket, isSubmitting, createTicketRating, triggerThankYouFlow],
  );

  return (
    <main className="relative isolate min-h-dvh w-full overflow-hidden bg-[#f4f8ff] text-[#0C3E63] dark:bg-[#0C3E63] dark:text-[#e9f2ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_8%,rgba(32,83,154,0.24),transparent_36%),radial-gradient(circle_at_94%_4%,rgba(253,203,53,0.28),transparent_33%),linear-gradient(175deg,#f7fbff_0%,#e9f1ff_54%,#fff7db_100%)] dark:bg-[radial-gradient(circle_at_6%_8%,rgba(32,83,154,0.55),transparent_38%),radial-gradient(circle_at_94%_4%,rgba(240,224,73,0.28),transparent_35%),linear-gradient(165deg,#0C3E63_0%,#213661_58%,#0C3E63_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-size:42px_42px] bg-[linear-gradient(rgba(17,69,145,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(17,69,145,0.16)_1px,transparent_1px)] dark:opacity-35 dark:bg-[linear-gradient(rgba(240,224,73,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(240,224,73,0.14)_1px,transparent_1px)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl items-center px-4 py-8 sm:px-6">
        <Card className="w-full border-[#20539A]/25 bg-white/88 shadow-[0_28px_80px_-32px_rgba(12,62,99,0.6)] backdrop-blur-sm dark:border-[#f0e049]/25 dark:bg-[#0f2f50]/82 dark:shadow-[0_28px_80px_-28px_rgba(6,28,49,0.95)]">
          <CardHeader className="space-y-4 border-b border-[#20539A]/15 pb-6 dark:border-[#f0e049]/15">
            <div>
              <CardTitle className="text-2xl tracking-tight text-[#0C3E63] dark:text-[#f4f8ff]">
                Calificacion de ticket
              </CardTitle>
              <CardDescription className="text-[#20539A]/85 dark:text-[#cfe1f5]">
                Esta pantalla se actualiza automaticamente cuando cambia el estado del ticket.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {waitingForScopeFallback ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#20539A]/35 bg-white/55 p-8 text-sm text-[#20539A] dark:border-[#f0e049]/35 dark:bg-[#10355a]/45 dark:text-[#dce9f8]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolviendo sucursal y ventanilla...
              </div>
            ) : !hasScope ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-50/95 p-4 text-amber-900 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">No se pudo resolver la sucursal y ventanilla</p>
                  <p>
                    Abra esta vista desde la pantalla del operador para cargar `branchId` y
                    `windowId`.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {showThankYouMessage ? (
                  <section className="rounded-2xl border border-emerald-500/40 bg-emerald-50/95 px-6 py-10 text-center text-emerald-900 dark:border-emerald-300/40 dark:bg-emerald-300/10 dark:text-emerald-100">
                    <CircleCheckBig className="mx-auto h-14 w-14" />
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                      Gracias por su calificacion
                    </h2>
                    <p className="mt-2 text-sm opacity-90">
                      Su opinion fue registrada correctamente.
                    </p>
                  </section>
                ) : null}

                {showRatingOnly ? (
                  <section
                    className="rounded-2xl border border-[#20539A]/25 bg-white/75 px-4 py-8 shadow-sm dark:border-[#f0e049]/30 dark:bg-[#123a61]/75"
                    aria-label="Seleccionar calificacion"
                  >
                    <p className="text-center text-sm font-medium text-[#20539A] dark:text-[#d7e6f7]">
                      Ticket finalizado
                    </p>
                    <p className="mt-2 text-center text-4xl font-semibold tracking-tight text-[#0C3E63] dark:text-[#f4f8ff] sm:text-5xl">
                      Como fue su atencion?
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
                      {FACE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = selectedScore === option.score;

                        return (
                          <button
                            key={option.score}
                            type="button"
                            onClick={() => {
                              if (disableScoreSelection) return;
                              void submitScore(option.score);
                            }}
                            className={cn(
                              "flex min-h-28 flex-col items-center justify-center rounded-xl border px-2 py-3 text-sm transition-all duration-200",
                              selected
                                ? "border-[#20539A] bg-[#dbe8ff] text-[#0C3E63] shadow-sm dark:border-[#f0e049]/80 dark:bg-[#f0e049]/20 dark:text-[#fff7cc]"
                                : "border-[#20539A]/22 bg-white/75 text-[#1f4f79] hover:bg-[#e7f0ff] dark:border-[#f0e049]/25 dark:bg-[#123a61]/70 dark:text-[#d5e5f8] dark:hover:bg-[#1a4a77]",
                            )}
                            aria-pressed={selected}
                            disabled={disableScoreSelection}
                          >
                            <Icon
                              className={cn(
                                "mb-2 h-10 w-10",
                                selected ? option.colorClassName : "text-muted-foreground",
                              )}
                            />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitting ? (
                      <p className="mt-4 text-center text-sm text-[#20539A]/85 dark:text-[#d7e6f7]">
                        Enviando calificacion...
                      </p>
                    ) : null}
                  </section>
                ) : null}

                {showTicketAndStatusCards ? (
                  <>
                    <section className="rounded-2xl border border-[#20539A]/20 bg-gradient-to-br from-white to-[#eef5ff] p-5 shadow-sm dark:border-[#f0e049]/20 dark:from-[#143c63] dark:to-[#0f2f50] flex flex-col justify-center items-center">
                      <p className="text-xs uppercase tracking-wide text-[#20539A]/75 dark:text-[#d7e6f7]/80">
                        Ticket actual
                      </p>
                      <p className="mt-2 text-4xl font-semibold tracking-wide text-[#0C3E63] dark:text-[#f4f8ff]">
                        {ticketState?.code ?? "--"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="border-[#20539A]/35 bg-white/80 text-[#0C3E63] dark:border-[#f0e049]/45 dark:bg-[#10365c] dark:text-[#e9f2ff]"
                        >
                          {ticketState?.status ?? "SIN TICKET"}
                        </Badge>
                        {ticketState?.isPaused ? (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-100/70 text-amber-900 dark:border-amber-300/45 dark:bg-amber-300/15 dark:text-amber-100"
                          >
                            PAUSADO
                          </Badge>
                        ) : null}
                      </div>
                    </section>
                  </>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
