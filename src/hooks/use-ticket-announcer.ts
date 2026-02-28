import { useCallback, useMemo, useRef, useState } from "react";

import { useNotificationSound } from "@/hooks/use-notification-sound";
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
  isAnnouncing: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  announceTicket: (ticket: PublicDisplayCalledTicket) => void;
};

type QueuedAnnouncement = {
  key: string;
  ticket: PublicDisplayCalledTicket;
};

const PROCESSED_ANNOUNCEMENT_LIMIT = 200;
const NOTIFICATION_SEQUENCE_DURATION_MS = 380;
const FIRST_NOTIFICATION_PRIME_DELAY_MS = 220;

export function useTicketAnnouncer(): UseTicketAnnouncerReturn {
  const isVoiceSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(true);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const voiceEnabledRef = useRef(true);

  const ticketQueue = useRef<QueuedAnnouncement[]>([]);
  const queuedKeys = useRef<Set<string>>(new Set());
  const processedKeys = useRef<string[]>([]);
  const speakingInProgress = useRef(false);
  const notificationPrimedRef = useRef(false);
  const { playNotification, unlockAudio } = useNotificationSound();

  const playPreAnnouncementNotification = useCallback(async () => {
    if (!notificationPrimedRef.current) {
      await unlockAudio();
      notificationPrimedRef.current = true;

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, FIRST_NOTIFICATION_PRIME_DELAY_MS);
      });
    }

    await playNotification();
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, NOTIFICATION_SEQUENCE_DURATION_MS);
    });

    await playNotification();
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, NOTIFICATION_SEQUENCE_DURATION_MS);
    });
  }, [playNotification, unlockAudio]);

  const clearQueue = useCallback(() => {
    ticketQueue.current = [];
    queuedKeys.current.clear();
    speakingInProgress.current = false;
    setIsAnnouncing(false);
  }, []);

  const hasProcessedKey = useCallback(
    (key: string): boolean => processedKeys.current.includes(key),
    [],
  );

  const rememberProcessedKey = useCallback((key: string) => {
    processedKeys.current.push(key);
    if (processedKeys.current.length > PROCESSED_ANNOUNCEMENT_LIMIT) {
      processedKeys.current = processedKeys.current.slice(-PROCESSED_ANNOUNCEMENT_LIMIT);
    }
  }, []);

  const playNextFromQueue = useCallback(() => {
    const playNext = () => {
      if (!isVoiceSupported || !voiceEnabledRef.current) {
        clearQueue();
        return;
      }

      if (speakingInProgress.current) {
        return;
      }

      const nextItem = ticketQueue.current.shift();
      if (!nextItem) {
        setIsAnnouncing(false);
        return;
      }

      speakingInProgress.current = true;
      setIsAnnouncing(true);

      const onDone = (markAsProcessed = true) => {
        queuedKeys.current.delete(nextItem.key);
        if (markAsProcessed) {
          rememberProcessedKey(nextItem.key);
        }

        speakingInProgress.current = false;
        setIsAnnouncing(false);
        playNext();
      };

      const speakTicket = () => {
        if (!isVoiceSupported || !voiceEnabledRef.current) {
          onDone(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(buildAnnouncementText(nextItem.ticket));
        utterance.lang = "es-ES";
        utterance.rate = 0.88;
        utterance.pitch = 1.02;
        utterance.volume = 1;

        utterance.onend = () => onDone();
        utterance.onerror = () => onDone();

        window.speechSynthesis.speak(utterance);
      };

      const runAnnouncement = async () => {
        await playPreAnnouncementNotification();
        speakTicket();
      };

      void runAnnouncement();
    };

    playNext();
  }, [clearQueue, isVoiceSupported, playPreAnnouncementNotification, rememberProcessedKey]);

  const setVoiceEnabled = useCallback(
    (enabled: boolean) => {
      voiceEnabledRef.current = enabled;
      setVoiceEnabledState(enabled);

      if (!isVoiceSupported) {
        return;
      }

      if (!enabled) {
        window.speechSynthesis.cancel();
        clearQueue();
        return;
      }

      playNextFromQueue();
    },
    [clearQueue, isVoiceSupported, playNextFromQueue],
  );

  const announceTicket = useCallback(
    (ticket: PublicDisplayCalledTicket) => {
      if (!isVoiceSupported || !voiceEnabledRef.current) {
        return;
      }

      const key = `${ticket.id}:${ticket.calledAt ?? ticket.createdAt}`;

      if (queuedKeys.current.has(key) || hasProcessedKey(key)) {
        return;
      }

      ticketQueue.current.push({ key, ticket });
      queuedKeys.current.add(key);
      playNextFromQueue();
    },
    [hasProcessedKey, isVoiceSupported, playNextFromQueue],
  );

  return {
    isVoiceSupported,
    voiceEnabled,
    isAnnouncing,
    setVoiceEnabled,
    announceTicket,
  };
}
