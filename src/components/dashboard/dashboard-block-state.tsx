import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardBlockStateProps = {
  mode: "loading" | "empty" | "error";
  message: string;
  onRetry?: () => void;
};

export function DashboardBlockState({
  mode,
  message,
  onRetry,
}: DashboardBlockStateProps) {
  if (mode === "loading") {
    return (
      <div className="flex min-h-52 items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="size-5 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center">
      <Inbox className="size-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
