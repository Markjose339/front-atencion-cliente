"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { PublicDisplayCalledTicket } from "@/types/public-display";
import { DisplayHeader } from "./display-header"; 
import { TicketGrid } from "./ticket-grid"; 
import { TickerFooter } from "./ticker-footer"; 
import { AdminMenu } from "./admin-menu"; 

type PublicDisplayBoardProps = {
  branchName: string;
  selectedServiceNames: string[];
  tickets: PublicDisplayCalledTicket[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  isVoiceSupported: boolean;
  voiceEnabled: boolean;
  isAnnouncing: boolean;
  highlightedCallKeys: string[];
  requiresConfiguration: boolean;
  onToggleVoice: () => void;
  onReload: () => void;
  onOpenSettings: () => void;
};

export function PublicDisplayBoard({
  tickets,
  isLoading,
  errorMessage,
  isVoiceSupported,
  voiceEnabled,
  isAnnouncing,
  highlightedCallKeys,
  requiresConfiguration,
  onToggleVoice,
  onReload,
  onOpenSettings,
}: PublicDisplayBoardProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const highlightedKeySet = useMemo(
    () => new Set(highlightedCallKeys),
    [highlightedCallKeys],
  );

  const isDarkTheme = resolvedTheme === "dark";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.ctrlKey && event.shiftKey && key === "m") {
        event.preventDefault();
        setMenuVisible((prev) => !prev);
      }
      if (key === "escape") setMenuVisible(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  return (
    <main className="relative isolate h-dvh w-full overflow-hidden bg-[#F0F4F8] text-[#0A2A4A] dark:bg-[#07192B] dark:text-[#E8F0FA]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,82,156,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(198,168,86,0.10),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,82,156,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,82,156,0.06)_1px,transparent_1px)] bg-size[40px_40px]" />

      {menuVisible && (
        <AdminMenu
          isDarkTheme={isDarkTheme}
          voiceEnabled={voiceEnabled}
          isVoiceSupported={isVoiceSupported}
          onToggleTheme={toggleTheme}
          onToggleVoice={onToggleVoice}
          onReload={onReload}
          onOpenSettings={onOpenSettings}
        />
      )}

      <div className="relative z-10 flex h-full flex-col">
        <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,7fr)_minmax(0,3fr)_auto]">
          <DisplayHeader isAnnouncing={isAnnouncing} voiceEnabled={voiceEnabled} />

          <TicketGrid
            tickets={tickets}
            isLoading={isLoading}
            errorMessage={errorMessage}
            highlightedKeySet={highlightedKeySet}
            requiresConfiguration={requiresConfiguration}
            onReload={onReload}
            onOpenSettings={onOpenSettings}
          />

          <TickerFooter />
        </section>
      </div>
    </main>
  );
}