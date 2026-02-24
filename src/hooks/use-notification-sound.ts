import { useCallback, useEffect, useRef } from "react";

type AudioContextConstructor = typeof AudioContext;

type WindowWithLegacyAudioContext = Window & {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
};

const getAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof window === "undefined") return null;

  const browserWindow = window as WindowWithLegacyAudioContext;
  return browserWindow.AudioContext ?? browserWindow.webkitAudioContext ?? null;
};

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) return null;

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    return () => {
      const context = audioContextRef.current;
      if (!context || context.state === "closed") return;

      void context.close();
      audioContextRef.current = null;
    };
  }, []);

  const playNotification = useCallback(async () => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    const now = context.currentTime;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(30, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(context.destination);

    const playTone = (offset: number, frequency: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "square"; 
      oscillator.frequency.setValueAtTime(frequency, now + offset);

      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.9, now + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + offset + duration
      );

      oscillator.connect(gain);
      gain.connect(compressor);

      oscillator.start(now + offset);
      oscillator.stop(now + offset + duration + 0.01);
    };

    playTone(0, 880, 0.14);
    playTone(0.18, 988, 0.16);
  }, [getAudioContext]);

  const unlockAudio = useCallback(async () => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {}
    }
  }, [getAudioContext]);

  return { playNotification, unlockAudio };
}