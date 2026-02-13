import { useCallback, useMemo, useRef, useState } from "react";

import { PublicDisplayCalledTicket } from "@/types/public-display";

const formatWindowName = (windowName: string): string => {
  const normalized = windowName.trim();
  if (!normalized) {
    return "ventanilla";
  }

  if (normalized.toLowerCase().includes("ventanilla")) {
    return normalized;
  }

  return `ventanilla ${normalized}`;
};

const buildAnnouncementText = (ticket: PublicDisplayCalledTicket): string => {
  const windowLabel = formatWindowName(ticket.windowName);
  const serviceLabel = ticket.serviceName.trim();
  return `Ticket ${ticket.code}, pase a ${windowLabel}, tipo ${serviceLabel}.`;
};

type UseTicketAnnouncerReturn = {
  isVoiceSupported: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  announceTicket: (ticket: PublicDisplayCalledTicket) => void;
};

export function useTicketAnnouncer(): UseTicketAnnouncerReturn {
  const isVoiceSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const lastAnnouncementKey = useRef<string>("");

  const announceTicket = useCallback(
    (ticket: PublicDisplayCalledTicket) => {
      if (!isVoiceSupported || !voiceEnabled) {
        return;
      }

      const speech = window.speechSynthesis;
      const key = `${ticket.id}:${ticket.calledAt ?? ticket.createdAt}`;

      if (lastAnnouncementKey.current === key) {
        return;
      }

      lastAnnouncementKey.current = key;

      const utterance = new SpeechSynthesisUtterance(buildAnnouncementText(ticket));
      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      speech.cancel();
      speech.speak(utterance);
    },
    [isVoiceSupported, voiceEnabled],
  );

  return {
    isVoiceSupported,
    voiceEnabled,
    setVoiceEnabled,
    announceTicket,
  };
}
