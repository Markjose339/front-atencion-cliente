"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdvertisementsPlaylistQuery } from "@/hooks/use-advertisements";
import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { Button } from "@/components/ui/button";

export function Announcements() {
  const { playlist } = useAdvertisementsPlaylistQuery("FULLSCREEN");
  const advertisements = useMemo(() => playlist.data ?? [], [playlist.data]);

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

  if (playlist.isLoading) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80">
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
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4">
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
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80">
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
          key={`${currentAdvertisement.id}-${safeIndex}`}
          src={currentFileUrl}
          autoPlay
          muted
          playsInline
          onEnded={goToNext}
          onError={goToNext}
          className={`h-full w-full object-cover ${transitionClass}`}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${currentAdvertisement.id}-${safeIndex}`}
          src={currentFileUrl}
          alt={currentAdvertisement.title}
          className={`h-full w-full object-cover ${transitionClass}`}
          loading="eager"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
        <p className="truncate text-sm font-medium">{currentAdvertisement.title}</p>
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
