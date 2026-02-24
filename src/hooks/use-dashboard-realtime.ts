"use client";

import { useEffect, useRef } from "react";

import { getSocket, isSocketAuthReady } from "@/lib/socket";
import { DashboardInvalidatePayload } from "@/types/dashboard";

type UseDashboardRealtimeOptions = {
  enabled?: boolean;
  debounceMs?: number;
  onInvalidate: () => void;
};

type DashboardJoinAck =
  | { ok: true; rooms: string[] }
  | { ok: false; message?: string };

const DEFAULT_DEBOUNCE_MS = 400;

const joinDashboardRoom = () => {
  const socket = getSocket();

  socket.emit(
    "dashboard:join",
    {},
    (ack?: DashboardJoinAck) => {
      void ack;
    },
  );
};

export function useDashboardRealtime({
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onInvalidate,
}: UseDashboardRealtimeOptions) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = getSocket();

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleInvalidate = () => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        onInvalidate();
      }, debounceMs);
    };

    const handleAuthReady = () => {
      joinDashboardRoom();
    };

    const handleConnect = () => {
      if (isSocketAuthReady()) {
        joinDashboardRoom();
      }
    };

    const handleInvalidate = (payload: DashboardInvalidatePayload) => {
      void payload;
      scheduleInvalidate();
    };

    socket.on("auth:ready", handleAuthReady);
    socket.on("connect", handleConnect);
    socket.on("dashboard:invalidate", handleInvalidate);

    if (socket.connected && isSocketAuthReady()) {
      joinDashboardRoom();
    }

    return () => {
      clearTimer();
      socket.off("auth:ready", handleAuthReady);
      socket.off("connect", handleConnect);
      socket.off("dashboard:invalidate", handleInvalidate);
    };
  }, [debounceMs, enabled, onInvalidate]);
}
