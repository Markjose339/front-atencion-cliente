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

type ChoiceCardToneStyle = {
  card: string
  icon: string
  badge: string
  arrow: string
  glow: string
}

const toneStyles: Record<ChoiceCardTone, ChoiceCardToneStyle> = {
  neutral: {
    card:
      "border-[#20539A]/45 bg-[linear-gradient(145deg,#ffffff_0%,#eef5ff_54%,#e1edff_100%)] text-[#0C3E63] hover:border-[#114591] dark:border-[#4f6e96]/85 dark:bg-[linear-gradient(145deg,#1d3f6a_0%,#17385f_50%,#213661_100%)] dark:text-[#e8f1ff] dark:hover:border-[#7ea2d3]",
    icon: "bg-white/90 text-[#114591] ring-1 ring-[#20539A]/35 dark:bg-[#12365b]/80 dark:text-[#e8f1ff] dark:ring-[#5c7ca5]/70",
    badge: "border-[#20539A]/40 bg-white/90 text-[#114591] dark:border-[#5e7ea7]/80 dark:bg-[#12385f]/75 dark:text-[#dce9ff]",
    arrow: "border-[#20539A]/35 bg-white/90 text-[#114591] dark:border-[#5f80a9]/75 dark:bg-[#12395f]/80 dark:text-[#d8e7ff]",
    glow: "from-[#20539A]/35 via-transparent to-[#114591]/35 dark:from-[#20539A]/40 dark:to-[#114591]/30",
  },
  primary: {
    card:
      "border-[#114591] bg-[linear-gradient(150deg,#edf4ff_0%,#dce9ff_45%,#c9dcff_100%)] text-[#0C3E63] hover:border-[#0C3E63] dark:border-[#6d95cc]/80 dark:bg-[linear-gradient(150deg,#234f83_0%,#1b446f_48%,#213661_100%)] dark:text-[#f3f8ff] dark:hover:border-[#9cbce6]",
    icon: "bg-white/92 text-[#114591] ring-1 ring-[#20539A]/35 dark:bg-[#12395f]/80 dark:text-[#f3f8ff] dark:ring-[#6f97ce]/65",
    badge: "border-[#20539A]/40 bg-white/92 text-[#114591] dark:border-[#6c93c9]/70 dark:bg-[#16436d]/75 dark:text-[#e8f1f8]",
    arrow: "border-[#20539A]/35 bg-white/92 text-[#114591] dark:border-[#6f97cc]/65 dark:bg-[#16436d]/80 dark:text-[#e6f0ff]",
    glow: "from-[#20539A]/45 via-transparent to-[#114591]/45 dark:from-[#20539A]/42 dark:to-[#5b81b4]/30",
  },
  success: {
    card:
      "border-[#FDCB35] bg-[linear-gradient(150deg,#fffef5_0%,#fff6d0_48%,#F0E049_100%)] text-[#0C3E63] hover:border-[#EECA46] dark:border-[#F0E049]/55 dark:bg-[linear-gradient(150deg,#2a4b73_0%,#1f4469_54%,#213661_100%)] dark:text-[#f3f8ff] dark:hover:border-[#FDCB35]",
    icon: "bg-white/90 text-[#D38E2A] ring-1 ring-[#EECA46]/45 dark:bg-[#12385c]/80 dark:text-[#F0E049] dark:ring-[#FDCB35]/45",
    badge: "border-[#EECA46]/65 bg-white/90 text-[#D38E2A] dark:border-[#FDCB35]/55 dark:bg-[#224468]/75 dark:text-[#F0E049]",
    arrow: "border-[#EECA46]/55 bg-white/90 text-[#D38E2A] dark:border-[#FDCB35]/45 dark:bg-[#224568]/80 dark:text-[#F0E049]",
    glow: "from-[#F0E049]/55 via-transparent to-[#EECA46]/45 dark:from-[#F0E049]/34 dark:to-[#FDCB35]/24",
  },
  attention: {
    card:
      "border-[#D38E2A] bg-[linear-gradient(150deg,#fff8ea_0%,#ffe8b6_48%,#FDCB35_100%)] text-[#0C3E63] hover:border-[#EECA46] dark:border-[#EECA46]/58 dark:bg-[linear-gradient(150deg,#2d4867_0%,#1d3d5d_54%,#213661_100%)] dark:text-[#f5f9ff] dark:hover:border-[#FDCB35]",
    icon: "bg-white/90 text-[#D38E2A] ring-1 ring-[#D38E2A]/40 dark:bg-[#183958]/80 dark:text-[#FDCB35] dark:ring-[#EECA46]/45",
    badge: "border-[#D38E2A]/55 bg-white/90 text-[#D38E2A] dark:border-[#EECA46]/48 dark:bg-[#234160]/75 dark:text-[#FDCB35]",
    arrow: "border-[#D38E2A]/45 bg-white/90 text-[#D38E2A] dark:border-[#EECA46]/42 dark:bg-[#234060]/80 dark:text-[#F0E049]",
    glow: "from-[#FDCB35]/55 via-transparent to-[#D38E2A]/45 dark:from-[#FDCB35]/30 dark:to-[#EECA46]/20",
  },
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
  const style = toneStyles[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative mx-auto flex min-h-34 w-full max-w-140 items-center gap-5 overflow-hidden rounded-[1.75rem] border-2 p-6 text-left shadow-[0_20px_34px_-24px_rgba(12,62,99,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_44px_-24px_rgba(12,62,99,0.5)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#20539A]/35 dark:shadow-[0_24px_36px_-24px_rgba(0,0,0,0.75)] dark:focus-visible:ring-[#FDCB35]/35 disabled:cursor-not-allowed disabled:opacity-55 md:mx-0 md:max-w-none",
        style.card,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-r opacity-65 transition-opacity duration-300 group-hover:opacity-90",
          style.glow,
        )}
      />
      <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/30 blur-lg transition-transform duration-300 group-hover:scale-110 dark:bg-[#FDCB35]/20" />

      <div
        className={cn(
          "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105",
          style.icon,
        )}
      >
        {icon}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
        {badge ? (
          <span
            className={cn(
              "w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.11em]",
              style.badge,
            )}
          >
            {badge}
          </span>
        ) : null}

        <p className="truncate text-xl font-semibold leading-tight">{title}</p>
        <p className="text-sm text-current/80">{description}</p>
      </div>

      <div
        className={cn(
          "relative shrink-0 rounded-full border p-2 text-current transition-transform duration-300 group-hover:translate-x-1",
          style.arrow,
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </div>

      <span className="sr-only">{title}</span>
    </button>
  )
}