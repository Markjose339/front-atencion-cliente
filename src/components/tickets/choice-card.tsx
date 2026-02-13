import React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type ChoiceCardTone = "neutral" | "primary" | "success" | "attention"

interface ChoiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  badge?: string
  tone?: ChoiceCardTone
  className?: string
}

const toneStyles: Record<ChoiceCardTone, string> = {
  neutral:
    "border-border/90 bg-card/95 text-card-foreground hover:border-primary/40 hover:bg-accent/40",
  primary:
    "border-sky-300/80 bg-sky-50/90 text-sky-950 hover:border-sky-400 hover:bg-sky-100/80 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100 dark:hover:bg-sky-950/45",
  success:
    "border-emerald-300/80 bg-emerald-50/90 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100/80 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/45",
  attention:
    "border-amber-300/80 bg-amber-50/90 text-amber-950 hover:border-amber-400 hover:bg-amber-100/80 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/45",
}

export function ChoiceCard({
  title,
  description,
  icon,
  onClick,
  disabled,
  badge,
  tone = "neutral",
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border p-5 text-left shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_28px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-55",
        toneStyles[tone],
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-foreground/5 transition group-hover:scale-110" />

      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/75 text-foreground/80 shadow-sm transition group-hover:scale-105">
        {icon}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1">
        {badge ? (
          <span className="w-fit rounded-full border border-border/80 bg-background/75 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {badge}
          </span>
        ) : null}

        <p className="truncate text-lg font-semibold leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="relative shrink-0 rounded-full border border-border/80 bg-background/80 p-1.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground">
        <ChevronRight className="h-4 w-4" />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition group-hover:ring-foreground/5" />

      <span className="sr-only">
        {title}
      </span>
    </button>
  )
}
