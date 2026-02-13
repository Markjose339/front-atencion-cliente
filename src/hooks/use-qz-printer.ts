"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Ticket } from "@/types/ticket";
import { toast } from "sonner";

const getQZPrinter = async () => {
  if (typeof window === "undefined") {
    throw new Error("QZ Tray solo funciona en el navegador");
  }
  const { QZPrinter } = await import("@/lib/qz-printer");
  return QZPrinter.getInstance();
};

export function useQZPrinter() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isCheckingRef = useRef(false);

  const checkConnection = useCallback(async () => {
    if (isCheckingRef.current) return;

    isCheckingRef.current = true;

    try {
      setIsChecking(true);
      const printer = await getQZPrinter();
      await printer.connect();
      setIsConnected(printer.isConnected());
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [checkConnection]);

  const printTicket = useCallback(
    async (ticket: Ticket): Promise<boolean> => {
      try {
        const printer = await getQZPrinter();
        await printer.printTicket(ticket);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al imprimir";
        toast.error(message);
        return false;
      }
    },
    []
  );

  return {
    isConnected,
    isChecking,
    printTicket,
    checkConnection,
  };
}
