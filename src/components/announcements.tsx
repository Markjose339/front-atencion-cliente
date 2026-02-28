"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Volume2, WifiOff } from "lucide-react";

import { useAdvertisementsPlaylistQuery } from "@/hooks/use-advertisements";
import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { Button } from "@/components/ui/button";

type AnnouncementsProps = {
  duckAudio?: boolean;
};

type Advertisement = {
  id: string;
  title: string;
  fileUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  durationSeconds?: number | null;
  transition?: "FADE" | "SLIDE" | null;
};

const NORMAL_VIDEO_VOLUME = 0.50;
const DUCKED_VIDEO_VOLUME = 0.015;
const VIDEO_START_TIMEOUT_MS = 3_000;
const AUTO_UNMUTE_INITIAL_DELAY_MS = 300;
const AUTO_UNMUTE_RETRY_INTERVAL_MS = 1_000;
const AUDIO_UNLOCK_SESSION_KEY = "public_display_audio_unlocked_v1";
const AUDIO_UNLOCK_DETECTION_DELAY_MS = 600;

function getTransitionClass(transition: Advertisement["transition"]): string {
  switch (transition) {
    case "FADE":
      return "animate-in fade-in duration-500";
    case "SLIDE":
      return "animate-in slide-in-from-right-4 duration-500";
    default:
      return "";
  }
}

function FullscreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary/80">
      {children}
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-primary-foreground">
      {children}
    </div>
  );
}

function DotsIndicator({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  if (total <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === activeIndex ? "w-6 bg-white" : "w-2 bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

function AudioUnlockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center pb-8">
      <Button
        type="button"
        onClick={onUnlock}
        className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-full bg-black/65 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/85 active:scale-95"
      >
        <Volume2 className="h-4 w-4" />
        Activar audio
      </Button>
    </div>
  );
}

function usePlaylistIndex(length: number) {
  const [playbackStep, setPlaybackStep] = useState(0);

  const goToNext = useCallback(() => {
    setPlaybackStep((prev) => (length > 0 ? prev + 1 : 0));
  }, [length]);

  return {
    safeIndex: length > 0 ? playbackStep % length : 0,
    playbackStep,
    goToNext,
  };
}

function useImageAutoAdvance(
  advertisement: Advertisement | null,
  goToNext: () => void,
  playbackStep: number,
) {
  useEffect(() => {
    if (advertisement?.mediaType !== "IMAGE") {
      return;
    }

    const durationMs = Math.max(advertisement.durationSeconds ?? 5, 1) * 1000;
    const timerId = window.setTimeout(goToNext, durationMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [advertisement, goToNext, playbackStep]);
}

function useVideoDucking(
  advertisement: Advertisement | null,
  videoRef: RefObject<HTMLVideoElement | null>,
  duckAudio: boolean,
  playbackStep: number,
) {
  useEffect(() => {
    if (advertisement?.mediaType !== "VIDEO") {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.volume = duckAudio ? DUCKED_VIDEO_VOLUME : NORMAL_VIDEO_VOLUME;
  }, [advertisement, duckAudio, playbackStep, videoRef]);
}

function useVideoAutoUnmute(
  advertisement: Advertisement | null,
  videoRef: RefObject<HTMLVideoElement | null>,
  duckAudio: boolean,
  goToNext: () => void,
  playbackStep: number,
) {
  useEffect(() => {
    if (advertisement?.mediaType !== "VIDEO") {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;
    let retryId: number | null = null;
    let inProgress = false;

    const targetVolume = duckAudio ? DUCKED_VIDEO_VOLUME : NORMAL_VIDEO_VOLUME;

    const scheduleRetry = () => {
      if (cancelled) {
        return;
      }

      retryId = window.setTimeout(() => {
        void attemptUnmute();
      }, AUTO_UNMUTE_RETRY_INTERVAL_MS);
    };

    const attemptUnmute = async () => {
      if (cancelled || inProgress) {
        return;
      }

      inProgress = true;

      try {
        video.muted = false;
        video.volume = targetVolume;

        try {
          await video.play();
        } catch {}

        if (cancelled) {
          return;
        }

        const hasAudiblePlayback = !video.muted && !video.paused;
        if (hasAudiblePlayback) {
          return;
        }

        video.muted = true;
        try {
          await video.play();
        } catch {}

        scheduleRetry();
      } finally {
        inProgress = false;
      }
    };

    const initialId = window.setTimeout(() => {
      void attemptUnmute();
    }, AUTO_UNMUTE_INITIAL_DELAY_MS);

    const startGuardId = window.setTimeout(() => {
      if (!cancelled && video.paused && video.currentTime < 0.1) {
        goToNext();
      }
    }, VIDEO_START_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(initialId);
      window.clearTimeout(startGuardId);
      if (retryId !== null) {
        window.clearTimeout(retryId);
      }
    };
  }, [advertisement, duckAudio, goToNext, playbackStep, videoRef]);
}

function useAudioUnlock({
  videoRef,
  isVideoActive,
  mediaKey,
  targetVolume,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  isVideoActive: boolean;
  mediaKey: string;
  targetVolume: number;
}) {
  const [audioLocked, setAudioLocked] = useState(false);
  const [sessionUnlocked, setSessionUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.sessionStorage.getItem(AUDIO_UNLOCK_SESSION_KEY) === "1";
  });

  useEffect(() => {
    if (!isVideoActive) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;

    const probeAudioLock = async () => {
      if (cancelled) {
        return;
      }

      video.volume = targetVolume;
      video.muted = false;

      try {
        await video.play();
      } catch {
        if (!cancelled) {
          setAudioLocked(true);
        }
        return;
      }

      if (cancelled) {
        return;
      }

      const isAudible = !video.muted && !video.paused;
      setAudioLocked(!isAudible);
    };

    const detectionDelay = sessionUnlocked ? 250 : AUDIO_UNLOCK_DETECTION_DELAY_MS;
    const detectId = window.setTimeout(() => {
      void probeAudioLock();
    }, detectionDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(detectId);
    };
  }, [isVideoActive, mediaKey, sessionUnlocked, targetVolume, videoRef]);

  const unlock = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.volume = targetVolume;
    video.muted = false;

    try {
      await video.play();
      const isAudible = !video.muted && !video.paused;
      setAudioLocked(!isAudible);

      if (isAudible && typeof window !== "undefined") {
        window.sessionStorage.setItem(AUDIO_UNLOCK_SESSION_KEY, "1");
        setSessionUnlocked(true);
      }
    } catch {
      setAudioLocked(true);
    }
  }, [targetVolume, videoRef]);

  return { audioLocked, unlock };
}

export function Announcements({ duckAudio = false }: AnnouncementsProps) {
  const { playlist } = useAdvertisementsPlaylistQuery("FULLSCREEN");
  const advertisements = useMemo(() => (playlist.data ?? []) as Advertisement[], [playlist.data]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { safeIndex, playbackStep, goToNext } = usePlaylistIndex(advertisements.length);

  const currentAdvertisement = advertisements[safeIndex] ?? null;
  const currentFileUrl = currentAdvertisement
    ? resolveAdvertisementFileUrl(currentAdvertisement.fileUrl)
    : "";
  const transitionClass = getTransitionClass(currentAdvertisement?.transition ?? null);
  const mediaKey = currentAdvertisement
    ? `${currentAdvertisement.id}-${playbackStep}`
    : `empty-${playbackStep}`;
  const targetVolume = duckAudio ? DUCKED_VIDEO_VOLUME : NORMAL_VIDEO_VOLUME;
  const isVideoActive = currentAdvertisement?.mediaType === "VIDEO";
  const { audioLocked, unlock } = useAudioUnlock({
    videoRef,
    isVideoActive,
    mediaKey,
    targetVolume,
  });

  useImageAutoAdvance(currentAdvertisement, goToNext, playbackStep);
  useVideoDucking(currentAdvertisement, videoRef, duckAudio, playbackStep);
  useVideoAutoUnmute(currentAdvertisement, videoRef, duckAudio, goToNext, playbackStep);

  if (playlist.isLoading) {
    return (
      <FullscreenShell>
        <CenteredMessage>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando publicidades...
        </CenteredMessage>
      </FullscreenShell>
    );
  }

  if (playlist.error) {
    return (
      <FullscreenShell>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-primary-foreground">
          <WifiOff className="h-8 w-8 opacity-75" />
          <p className="text-sm">
            {(playlist.error as { message?: string }).message ??
              "No se pudo cargar la playlist"}
          </p>
          <Button variant="outline" size="sm" onClick={() => playlist.refetch()}>
            Reintentar
          </Button>
        </div>
      </FullscreenShell>
    );
  }

  if (!currentAdvertisement) {
    return (
      <FullscreenShell>
        <CenteredMessage>No hay publicidades activas para mostrar.</CenteredMessage>
      </FullscreenShell>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      {isVideoActive ? (
        <video
          ref={videoRef}
          key={mediaKey}
          src={currentFileUrl}
          autoPlay
          playsInline
          onLoadedMetadata={(event) => {
            event.currentTarget.volume = targetVolume;
          }}
          onEnded={goToNext}
          onError={goToNext}
          className={`h-full w-full object-contain ${transitionClass}`}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={mediaKey}
          src={currentFileUrl}
          alt={currentAdvertisement.title}
          className={`h-full w-full object-contain ${transitionClass}`}
          loading="eager"
          decoding="async"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/10" />

      <div className="absolute bottom-3 right-3 flex items-center justify-end">
        <DotsIndicator total={advertisements.length} activeIndex={safeIndex} />
      </div>

      {isVideoActive && audioLocked ? <AudioUnlockOverlay onUnlock={unlock} /> : null}
    </div>
  );
}
