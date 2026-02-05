"use client";

import * as qz from "qz-tray";
import { Ticket } from "@/types/ticket";

export class QZPrinter {
  private static instance: QZPrinter;
  private connected = false;

  private static readonly PRINTER_NAME = "EPSON TM-T20II Receipt";

  private constructor() { }

  static getInstance(): QZPrinter {
    if (!QZPrinter.instance) {
      QZPrinter.instance = new QZPrinter();
    }
    return QZPrinter.instance;
  }

  async connect(): Promise<void> {
    if (this.connected && qz.websocket.isActive()) return;

    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }

      const printer = await this.getPrinter();
      console.log("🖨️ Usando impresora:", printer);

      this.connected = true;
    } catch (error) {
      console.error("❌ Error conectando QZ Tray:", error);
      throw new Error(
        "No se pudo conectar a QZ Tray. Verifica que esté instalado y ejecutándose."
      );
    }
  }

  private async getPrinter(): Promise<string> {
    const result = await qz.printers.find();

    const printers: string[] = Array.isArray(result)
      ? result
      : [result];

    console.log("🖨️ Impresoras disponibles:", printers);

    const printer = printers.find(
      (name) => name === QZPrinter.PRINTER_NAME
    );

    if (!printer) {
      throw new Error(
        `La impresora "${QZPrinter.PRINTER_NAME}" no está disponible`
      );
    }

    return printer;
  }

  async printTicket(ticket: Ticket): Promise<void> {
    await this.connect();

    const config = qz.configs.create(QZPrinter.PRINTER_NAME, {
      encoding: "CP850",
      scaleContent: false,
    });

    const data = this.generateESCPOS(ticket);

    try {
      await qz.print(config, data);
      console.log("✅ Ticket impreso:", ticket.code);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error de impresión: ${error.message}`);
      }
      throw new Error("Error de impresión desconocido");
    }
  }

  private generateESCPOS(ticket: Ticket): string[] {
    const ESC = "\x1B";
    const GS = "\x1D";
    const LF = "\n";

    const utcDate = new Date(ticket.createdAt);
    const boliviaTime = new Date(utcDate.getTime() + 4 * 60 * 60 * 1000);

    const fecha = boliviaTime.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const hora = boliviaTime.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return [
      ESC + "@" + ESC + "a1" + ESC + "M" + "\x00" + GS + "!" + "\x00",
      "AGENCIA BOLIVIANA DE CORREOS" + LF,
      LF,
      GS + "!" + "\x11" + ESC + "E" + "\x01",
      ticket.code + LF,
      ESC + "E" + "\x00" + GS + "!" + "\x00",
      LF,
      "Paquete: " + ticket.packageCode + LF,
      `Fecha: ${fecha}  Hora: ${hora}` + LF,
      LF,
      "Espere su turno - Gracias por su paciencia" + LF,
      LF,
      ESC + "d" + "\x02" + GS + "V" + "\x01",
    ];
  }

  async disconnect(): Promise<void> {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return qz.websocket.isActive();
  }
}
