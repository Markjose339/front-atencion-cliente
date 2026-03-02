import { useCallback, useEffect, useRef } from "react";

export type NotificationSoundType = "tv" | "operator";

const waitForEnded = (audio: HTMLAudioElement) =>
  new Promise<void>((resolve) => {
    const done = () => resolve();
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true });
  });

export function useNotificationSound() {
  const tvAudioRef = useRef<HTMLAudioElement | null>(null);
  const operatorAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tv = new Audio("/alerta-tv-3.mp3");
    const op = new Audio("/alerta-op.mp3");

    tv.preload = "auto";
    op.preload = "auto";


    tvAudioRef.current = tv;
    operatorAudioRef.current = op;

    return () => {
      tvAudioRef.current = null;
      operatorAudioRef.current = null;
    };
  }, []);

  const playNotification = useCallback(async (type: NotificationSoundType = "tv") => {
    const audio = type === "operator" ? operatorAudioRef.current : tvAudioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;

      const endedPromise = waitForEnded(audio);

      await audio.play();
      await endedPromise;
    } catch {
    }
  }, []);

  const unlockAudio = useCallback(async () => {
    const audio = tvAudioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      const prevVolume = audio.volume;
      audio.volume = 0;

      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      audio.volume = prevVolume;
    } catch { }
  }, []);

  return { playNotification, unlockAudio };
}