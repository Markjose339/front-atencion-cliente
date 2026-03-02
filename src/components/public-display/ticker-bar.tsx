"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type TickerBarProps = {
  items: string[];
  speed?: number;
  gapMs?: number;
};

function useContainerWidth<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!node) return;
    const ro = new ResizeObserver((e) => setWidth(e[0].contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);

  return { ref: setNode, width };
}

export function TickerBar({ items, speed = 120, gapMs = 500 }: TickerBarProps) {
  const [index, setIndex] = useState(0);
  const ghostRef = useRef<HTMLDivElement>(null);

  const cleanItems = useMemo(
    () => items.map((t) => (t ?? "").trim()).filter(Boolean),
    [items]
  );

  const safeIndex = cleanItems.length ? index % cleanItems.length : 0;
  const current = cleanItems[safeIndex] ?? "";

  const { ref: wrapRef, width: wrapWidth } = useContainerWidth<HTMLDivElement>();

  const [textWidth, setTextWidth] = useState(0);

  useLayoutEffect(() => {
    if (ghostRef.current) {
      setTextWidth(ghostRef.current.scrollWidth);
    }
  }, [current]);

  const ready = cleanItems.length > 0 && wrapWidth > 0 && textWidth > 0;
  const fromX = wrapWidth;
  const toX = -textWidth;
  const distance = fromX - toX;
  const travelSec = ready && distance > 0 ? distance / speed : 0;

  useEffect(() => {
    if (!ready || travelSec <= 0) return;
    const id = window.setTimeout(
      () => setIndex((p) => p + 1),
      travelSec * 1000 + gapMs
    );
    return () => window.clearTimeout(id);
  }, [ready, travelSec, gapMs, safeIndex]);

  return (
    <div ref={wrapRef} className="relative h-12 w-full overflow-hidden">
      <div
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none invisible absolute whitespace-nowrap pl-24 pr-8 text-sm font-medium tracking-wide"
      >
        {current}
      </div>

      {!cleanItems.length ? (
        <div className="flex h-full items-center px-4 text-xs text-[#7BAFD4]/60">
          Sin mensajes activos.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${safeIndex}-${current}`}
            className="absolute left-0 top-0 flex h-full items-center whitespace-nowrap pl-24 pr-8 text-sm font-medium tracking-wide text-[#E8F0FA]"
            initial={{ x: fromX, opacity: 0 }}
            animate={{
              x: toX,
              opacity: 1,
              transition: {
                x: { duration: travelSec, ease: "linear" },
                opacity: { duration: 0.25, ease: "easeOut" },
              },
            }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
          >
            {current}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}