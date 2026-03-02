"use client";

import {
  Moon,
  RefreshCw,
  Settings2,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminMenuProps = {
  isDarkTheme: boolean;
  voiceEnabled: boolean;
  isVoiceSupported: boolean;
  onToggleTheme: () => void;
  onToggleVoice: () => void;
  onReload: () => void;
  onOpenSettings: () => void;
};

/**
 * Floating admin menu — shown only when the operator presses Ctrl+Shift+M.
 * Styled to feel like a secure, professional control panel.
 */
export function AdminMenu({
  isDarkTheme,
  voiceEnabled,
  isVoiceSupported,
  onToggleTheme,
  onToggleVoice,
  onReload,
  onOpenSettings,
}: AdminMenuProps) {
  return (
    <div className="absolute right-5 top-4 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={[
              "h-10 rounded-xl border font-semibold tracking-wide",
              "border-[#C6A856]/60 bg-[#0A2A4A]/90 text-[#C6A856]",
              "hover:border-[#C6A856] hover:bg-[#0A2A4A] hover:text-[#DFBC6A]",
              "dark:border-[#5e81ab]/70 dark:bg-white/90 dark:text-[#0A2A4A]",
              "dark:hover:border-[#0A2A4A] dark:hover:bg-white",
              "shadow-lg shadow-black/30 backdrop-blur-sm",
            ].join(" ")}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Menú
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 border-[#C6A856]/30 bg-[#0A2A4A] text-[#E8F0FA] dark:border-[#4A7BA5]/40 dark:bg-white dark:text-[#0A2A4A]"
        >
          <DropdownMenuLabel className="text-[#C6A856] dark:text-[#0A2A4A]">
            Pantalla pública
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#C6A856]/20 dark:bg-[#4A7BA5]/30" />

          <DropdownMenuItem onSelect={onOpenSettings}>
            <Settings2 className="mr-2 h-4 w-4" />
            Configurar pantalla
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={onReload}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refrescar tickets
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={onToggleTheme}>
            {isDarkTheme ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Modo claro
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Modo oscuro
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={onToggleVoice}
            disabled={!isVoiceSupported}
            title={
              isVoiceSupported
                ? "Activar o desactivar voz"
                : "Tu navegador no soporta voz"
            }
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Voz activa
              </>
            ) : (
              <>
                <VolumeX className="mr-2 h-4 w-4" />
                Voz apagada
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}