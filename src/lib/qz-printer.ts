"use client";

import * as qz from "qz-tray";
import { api } from "@/lib/api";
import { Ticket } from "@/types/ticket";

export class QZPrinter {
  private static instance: QZPrinter;
  private static readonly PRINTER_NAME = "EPSON TM-T20II Receipt";
  private static readonly CERT_PATH = "/qz/cert";
  private static readonly SIGN_PATH = "/qz/sign";

  private connected = false;
  private operationQueue: Promise<void> = Promise.resolve();
  private securityConfigured = false;
  private securityConfigurationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): QZPrinter {
    if (!QZPrinter.instance) {
      QZPrinter.instance = new QZPrinter();
    }

    return QZPrinter.instance;
  }

  private enqueueOperation<T>(operation: () => Promise<T>): Promise<T> {
    const nextOperation = this.operationQueue.then(operation, operation);

    this.operationQueue = nextOperation.then(
      () => undefined,
      () => undefined
    );

    return nextOperation;
  }

  private mapConnectionError(error: unknown): Error {
    if (!(error instanceof Error)) {
      return new Error(
        "No se pudo conectar a QZ Tray. Verifica que este instalado y ejecutandose."
      );
    }

    const normalized = error.message.toLowerCase();

    if (normalized.includes("cancelled by user")) {
      return new Error("La conexion con QZ Tray fue cancelada por el usuario.");
    }

    if (
      normalized.includes("waiting for previous disconnect request to complete")
    ) {
      return new Error(
        "QZ Tray aun esta cerrando la conexion anterior. Intente nuevamente."
      );
    }

    if (
      normalized.includes("no esta disponible") ||
      normalized.includes("not available")
    ) {
      return error;
    }

    if (normalized.includes("next_public_api_url")) {
      return error;
    }

    if (normalized.includes("failed to sign request")) {
      return new Error(
        "No se pudo firmar la peticion para QZ Tray. Verifica el endpoint /qz/sign."
      );
    }

    return new Error(
      "No se pudo conectar a QZ Tray. Verifica que este instalado y ejecutandose."
    );
  }

  private toError(error: unknown, fallback: string): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) {
        return new Error(message);
      }
    }

    return new Error(fallback);
  }

  private async fetchCertificate(): Promise<string> {
    try {
      return await api.get<string>(QZPrinter.CERT_PATH, {
        headers: {
          Accept: "text/plain",
        },
        cache: "no-store",
      });
    } catch (error) {
      throw this.toError(
        error,
        "No se pudo obtener el certificado de QZ desde el backend."
      );
    }
  }

  private async fetchSignature(data: string): Promise<string> {
    try {
      const payload = await api.post<{ signature?: unknown }>(
        QZPrinter.SIGN_PATH,
        { data },
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (
        typeof payload.signature !== "string" ||
        payload.signature.length === 0
      ) {
        throw new Error("La respuesta de /qz/sign no contiene una firma valida.");
      }

      return payload.signature;
    } catch (error) {
      throw this.toError(
        error,
        "No se pudo firmar la peticion de QZ en el backend."
      );
    }
  }

  private async ensureSecurityConfigured(): Promise<void> {
    if (this.securityConfigured) {
      return;
    }

    if (this.securityConfigurationPromise) {
      return this.securityConfigurationPromise;
    }

    this.securityConfigurationPromise = (async () => {
      qz.security.setSignatureAlgorithm("SHA512");
      qz.security.setCertificatePromise(
        async () => this.fetchCertificate(),
        { rejectOnFailure: true }
      );
      qz.security.setSignaturePromise(async (toSign) =>
        this.fetchSignature(toSign)
      );

      this.securityConfigured = true;
    })()
      .catch((error) => {
        this.securityConfigured = false;
        throw error;
      })
      .finally(() => {
        this.securityConfigurationPromise = null;
      });

    return this.securityConfigurationPromise;
  }

  async connect(): Promise<void> {
    return this.enqueueOperation(async () => {
      await this.ensureSecurityConfigured();

      if (this.connected && qz.websocket.isActive()) {
        return;
      }

      try {
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect();
        }

        await this.getPrinter();
        this.connected = true;
      } catch (error) {
        this.connected = false;
        throw this.mapConnectionError(error);
      }
    });
  }

  private async getPrinter(): Promise<string> {
    const result = await qz.printers.find();

    const printers: string[] = Array.isArray(result) ? result : [result];

    const printer = printers.find(
      (name) => name === QZPrinter.PRINTER_NAME
    );

    if (!printer) {
      throw new Error(
        `La impresora "${QZPrinter.PRINTER_NAME}" no esta disponible`
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
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error de impresion: ${error.message}`);
      }

      throw new Error("Error de impresion desconocido");
    }
  }

  private generateESCPOS(ticket: Ticket): string[] {
    const ESC = "\x1B";
    const GS = "\x1D";
    const LF = "\n";
    const packageCode = ticket.packageCode?.trim() ?? "";
    const hasPackageCode = packageCode.length > 0;

    const date = new Date(ticket.createdAt);

    const fechaHora = new Intl.DateTimeFormat("es-BO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/La_Paz",
    }).format(date);

    return [
      ESC + "@" + ESC + "a" + "\x01" + ESC + "M" + "\x00" + GS + "!" + "\x00",
      "CORREOS DE BOLIVIA" + LF,
      `Sucursal: ${ticket.branchName}` + LF,
      LF,
      GS + "!" + "\x11" + ESC + "E" + "\x01",
      ticket.code + LF,
      ESC + "E" + "\x00" + GS + "!" + "\x00",
      LF,
      ...(hasPackageCode ? ["Paquete: " + packageCode + LF] : []),
      `Fecha/Hora: ${fechaHora}` + LF,
      "Espere su turno - Gracias por su paciencia" + LF,
      LF,
      ESC + "d" + "\x02" + GS + "V" + "\x01",
    ];
  }

  async disconnect(): Promise<void> {
    return this.enqueueOperation(async () => {
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
      }

      this.connected = false;
    });
  }

  isConnected(): boolean {
    return qz.websocket.isActive();
  }
}
