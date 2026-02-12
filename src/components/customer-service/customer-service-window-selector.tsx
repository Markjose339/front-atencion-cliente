import { Building2, MonitorDot } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerServiceWindowOption } from "@/types/customer-service";

interface CustomerServiceWindowSelectorProps {
  options: CustomerServiceWindowOption[];
  onSelectWindow: (option: CustomerServiceWindowOption) => void;
}

export function CustomerServiceWindowSelector({
  options,
  onSelectWindow,
}: CustomerServiceWindowSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Selecciona ventanilla</h1>
        <p className="text-sm text-muted-foreground">
          Tienes multiples asignaciones. Elige desde que ventanilla y servicio atenderas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <button
            key={`${option.branchId}:${option.serviceId}`}
            type="button"
            onClick={() => onSelectWindow(option)}
            className="text-left"
          >
            <Card className="h-full border-muted/70 py-4 transition hover:border-primary/50 hover:bg-muted/30">
              <CardHeader className="px-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MonitorDot className="h-4 w-4 text-primary" />
                  {option.windowName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Building2 className="h-3.5 w-3.5" />
                  {option.branchName}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 text-xs text-muted-foreground">
                Servicio: {option.serviceName} ({option.serviceCode})
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
