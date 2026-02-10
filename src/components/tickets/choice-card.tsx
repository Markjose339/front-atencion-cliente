import React from "react"

interface ChoiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function ChoiceCard({
  title,
  description,
  icon,
  onClick,
  disabled,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        group flex w-full flex-col items-center justify-center
        min-h-45 sm:min-h-50 lg:min-h-55
        h-auto
        gap-3 sm:gap-4
        rounded-2xl sm:rounded-3xl
        border-2 bg-card text-center
        p-4 sm:p-5
        shadow-md transition-all duration-200
        hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:bg-primary/5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:cursor-not-allowed disabled:opacity-50
      "
    >
      <div
        className="
          flex items-center justify-center
          h-14 w-14 sm:h-16 sm:w-16
          rounded-xl sm:rounded-2xl
          bg-primary/10 text-primary
          transition group-hover:scale-110
        "
      >
        {icon}
      </div>

      <div className="space-y-1 sm:space-y-2 px-1">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
          {title}
        </p>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
    </button>
  )
}
