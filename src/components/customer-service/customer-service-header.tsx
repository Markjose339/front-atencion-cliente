import { Building2, MessageSquare, MonitorDot, PhoneCall } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerServiceWindowOption } from "@/types/customer-service";

interface CustomerServiceHeaderProps {
  selectedOption: CustomerServiceWindowOption;
  canChangeWindow: boolean;
  rateUrl: string;
  onChangeWindow: () => void;
  onCallNext: () => void;
  isCallingNext: boolean;
  disableCallNext: boolean;
}

export function CustomerServiceHeader({
  selectedOption,
  canChangeWindow,
  rateUrl,
  onChangeWindow,
  onCallNext,
  isCallingNext,
  disableCallNext,
}: CustomerServiceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Atencion al cliente</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            <MonitorDot className="mr-1 h-4 w-4" />
            {selectedOption.windowName}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <Building2 className="mr-1 h-4 w-4" />
            {selectedOption.branchName}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {selectedOption.serviceName}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        {canChangeWindow && (
          <Button type="button" variant="outline" onClick={onChangeWindow}>
            Cambiar ventanilla
          </Button>
        )}

        <Button type="button" variant="secondary" asChild>
          <Link href={rateUrl} target="_blank" rel="noopener noreferrer">
            <MessageSquare className="mr-2 h-4 w-4" />
            Abrir /rate
          </Link>
        </Button>

        <Button type="button" onClick={onCallNext} disabled={disableCallNext}>
          <PhoneCall className="mr-2 h-4 w-4" />
          {isCallingNext ? "Llamando..." : "Llamar siguiente"}
        </Button>
      </div>
    </div>
  );
}
