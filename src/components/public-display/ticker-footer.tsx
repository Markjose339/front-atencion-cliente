"use client";

import { useMemo } from "react";
import { useAdvertisementsPlaylistQuery } from "@/hooks/use-advertisements";
import { Advertisement } from "@/types/advertisement";
import { TickerBar } from "./ticker-bar";

export function TickerFooter() {
  const { playlist: tickerPlaylist } = useAdvertisementsPlaylistQuery("TICKER");

  const tickerItems = useMemo(
    () =>
      ((tickerPlaylist.data ?? []) as Advertisement[])
        .filter((item) => item.mediaType === "TEXT")
        .map((item) => item.textContent?.trim() ?? "")
        .filter((t) => t.length > 0),
    [tickerPlaylist.data],
  );

  return (
    <div className="shrink-0 border-t border-[#C6A856]/25 bg-[#061525]/95 backdrop-blur-sm">
      <TickerBar items={tickerItems} />
    </div>
  );
}