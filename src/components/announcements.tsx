"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdvertisementsPlaylistQuery } from "@/hooks/use-advertisements";
import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { Button } from "@/components/ui/button";

type AnnouncementsProps = {
  duckAudio?: boolean;
};

const NORMAL_VIDEO_VOLUME = 1;
const DUCKED_VIDEO_VOLUME = 0.1;
const VIDEO_START_TIMEOUT_MS = 3000;

export function Announcements({ duckAudio = false }: AnnouncementsProps) {
  const { playlist } = useAdvertisementsPlaylistQuery("FULLSCREEN");
  const advertisements = useMemo(() => playlist.data ?? [], [playlist.data]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((previous) => {
      if (advertisements.length === 0) {
        return 0;
      }

      return (previous + 1) % advertisements.length;
    });
  }, [advertisements.length]);
  const safeIndex =
    advertisements.length > 0 ? currentIndex % advertisements.length : 0;
  const currentAdvertisement = advertisements[safeIndex] ?? null;
  const currentFileUrl = currentAdvertisement
    ? resolveAdvertisementFileUrl(currentAdvertisement.fileUrl)
    : "";

  useEffect(() => {
    if (!currentAdvertisement) {
      return;
    }

    if (currentAdvertisement.mediaType !== "IMAGE") {
      return;
    }

    const durationSeconds = Math.max(currentAdvertisement.durationSeconds ?? 1, 1);
    const timerId = window.setTimeout(goToNext, durationSeconds * 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [currentAdvertisement, goToNext]);

  useEffect(() => {
    if (currentAdvertisement?.mediaType !== "VIDEO") {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    videoElement.volume = duckAudio ? DUCKED_VIDEO_VOLUME : NORMAL_VIDEO_VOLUME;
  }, [currentAdvertisement, duckAudio, safeIndex]);

  useEffect(() => {
    if (currentAdvertisement?.mediaType !== "VIDEO") {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    let cancelled = false;
    videoElement.muted = false;

    const tryPlay = async () => {
      try {
        await videoElement.play();
      } catch {
        if (cancelled) {
          return;
        }

        try {
          // Fallback para navegadores que bloquean autoplay con audio.
          videoElement.muted = true;
          await videoElement.play();
        } catch {
          if (!cancelled) {
            goToNext();
          }
        }
      }
    };

    void tryPlay();

    const startGuard = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const stalledAtStart = videoElement.paused && videoElement.currentTime < 0.1;
      if (stalledAtStart) {
        goToNext();
      }
    }, VIDEO_START_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(startGuard);
    };
  }, [currentAdvertisement, goToNext, safeIndex]);

  if (playlist.isLoading) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary/80">
        <div className="flex h-full items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-primary-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando publicidades...
          </div>
        </div>
      </div>
    );
  }

  if (playlist.error) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary/80 p-4">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-primary-foreground">
          <p className="text-sm">
            {(playlist.error as { message?: string }).message ?? "No se pudo cargar la playlist"}
          </p>
          <Button variant="outline" size="sm" onClick={() => playlist.refetch()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!currentAdvertisement) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary/80">
        <div className="flex h-full items-center justify-center text-center text-sm text-primary-foreground">
          No hay publicidades activas para mostrar.
        </div>
      </div>
    );
  }

  const transitionClass =
    currentAdvertisement.transition === "FADE"
      ? "animate-in fade-in duration-500"
      : currentAdvertisement.transition === "SLIDE"
        ? "animate-in slide-in-from-right-4 duration-500"
        : "";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      {currentAdvertisement.mediaType === "VIDEO" ? (
        <video
          ref={videoRef}
          key={`${currentAdvertisement.id}-${safeIndex}`}
          src={currentFileUrl}
          autoPlay
          playsInline
          onLoadedMetadata={(event) => {
            event.currentTarget.volume = duckAudio ? DUCKED_VIDEO_VOLUME : NORMAL_VIDEO_VOLUME;
          }}
          onEnded={goToNext}
          onError={goToNext}
          className={`h-full w-full object-contain ${transitionClass}`}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${currentAdvertisement.id}-${safeIndex}`}
          src={currentFileUrl}
          alt={currentAdvertisement.title}
          className={`h-full w-full object-contain ${transitionClass}`}
          loading="eager"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/10" />

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-end gap-2 text-white">
        <div className="flex items-center gap-1">
          {advertisements.map((item, index) => (
            <span
              key={item.id}
              className={`h-2 rounded-full transition-all ${
                index === safeIndex ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
