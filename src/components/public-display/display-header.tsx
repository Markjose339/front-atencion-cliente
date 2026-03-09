"use client";

import { Announcements } from "@/components/public-display/announcements";

type DisplayHeaderProps = {
  isAnnouncing: boolean;
  voiceEnabled: boolean;
};

export function DisplayHeader({ isAnnouncing, voiceEnabled }: DisplayHeaderProps) {
  return (
    <div
      className={[
        "relative min-h-0 overflow-hidden",
        "bg-[#0A2A4A]/92 dark:bg-white/88",
        "shadow-[0_24px_48px_-28px_rgba(5,15,30,0.85)]",
        "border-b border-[#00529C]/30 dark:border-[#4A7BA5]/40",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-transparent via-[#C6A856] to-transparent opacity-70" />

      <Announcements duckAudio={isAnnouncing && voiceEnabled} />
    </div>
  );
}