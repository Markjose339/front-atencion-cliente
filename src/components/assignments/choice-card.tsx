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
      onClick={onClick}
      disabled={disabled}
      className="
        group flex w-full flex-col items-center justify-center
        h-56 sm:h-64 md:h-72 lg:h-80
        gap-4 sm:gap-5 md:gap-6
        rounded-2xl sm:rounded-3xl
        border-2 bg-card text-center
        shadow-md transition-all duration-200
        hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:bg-primary/5
        focus-visible:ring-2 focus-visible:ring-primary
        disabled:cursor-not-allowed disabled:opacity-50
      "
    >
      <div
        className="
          flex items-center justify-center
          h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24
          rounded-xl sm:rounded-2xl
          bg-primary/10 text-primary
          transition group-hover:scale-110
        "
      >
        {icon}
      </div>

      <div className="space-y-1 sm:space-y-2 px-2">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold">
          {title}
        </p>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
    </button>
  )
}

