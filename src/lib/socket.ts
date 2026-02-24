import { PublicQueueJoinPayload } from "@/types/public";
import { io, Socket } from "socket.io-client";

type QueueRegisterAck = {
  ok: boolean;
  rooms?: string[];
  message?: string;
};

type PublicJoinAck = {
  ok: boolean;
  room?: string;
  message?: string;
};

let socket: Socket | null = null;
let operatorRoomsRegistered = false;
let authReady = false;

const getWsUrl = (): string => {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!rawApiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  const normalized = rawApiUrl.replace(/\/+$/, "");

  if (normalized.endsWith("/api")) {
    return normalized.slice(0, -4);
  }

  return normalized;
};

const waitForSocketConnection = async (
  targetSocket: Socket,
  timeoutMs = 7000,
): Promise<void> => {
  if (targetSocket.connected) return;

  await new Promise<void>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("No se pudo conectar al websocket"));
    }, timeoutMs);

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId);
      targetSocket.off("connect", onConnect);
      targetSocket.off("connect_error", onConnectError);
    };

    const onConnect = () => {
      cleanup();
      resolve();
    };

    const onConnectError = (error: Error) => {
      cleanup();
      reject(error);
    };

    targetSocket.on("connect", onConnect);
    targetSocket.on("connect_error", onConnectError);
    targetSocket.connect();
  });
};

const waitForAuthReady = async (
  targetSocket: Socket,
  timeoutMs = 3000,
): Promise<void> => {
  if (authReady) return;

  await new Promise<void>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout esperando auth:ready"));
    }, timeoutMs);

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId);
      targetSocket.off("auth:ready", onReady);
    };

    const onReady = () => {
      authReady = true;
      cleanup();
      resolve();
    };

    targetSocket.on("auth:ready", onReady);
  });
};

const emitWithAck = <TAck>(
  targetSocket: Socket,
  event: string,
  payload?: unknown,
  timeoutMs = 7000,
): Promise<TAck> => {
  return new Promise<TAck>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      reject(new Error(`Timeout esperando respuesta para ${event}`));
    }, timeoutMs);

    const onAck = (response: TAck) => {
      globalThis.clearTimeout(timeoutId);
      resolve(response);
    };

    if (payload === undefined) {
      targetSocket.emit(event, onAck);
      return;
    }

    targetSocket.emit(event, payload, onAck);
  });
};

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getWsUrl(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    const resetFlags = () => {
      operatorRoomsRegistered = false;
      authReady = false;
    };

    socket.on("connect", resetFlags);
    socket.on("disconnect", resetFlags);
    socket.on("connect_error", resetFlags);

    socket.on("auth:ready", () => {
      authReady = true;
    });
  }

  return socket;
}

export function isSocketAuthReady(): boolean {
  return authReady;
}

export async function ensureOperatorQueueRegistration(
  targetSocket: Socket = getSocket(),
): Promise<string[]> {
  await waitForSocketConnection(targetSocket);

  if (operatorRoomsRegistered) return [];

  await waitForAuthReady(targetSocket).catch(() => undefined);

  const response = await emitWithAck<QueueRegisterAck>(
    targetSocket,
    "queue:register",
  );

  if (!response?.ok && response.message === "No autenticado") {
    await new Promise((r) => setTimeout(r, 200));
    const retry = await emitWithAck<QueueRegisterAck>(
      targetSocket,
      "queue:register",
    );
    if (!retry?.ok) {
      throw new Error(retry?.message ?? "No se pudo registrar las colas del operador");
    }
    operatorRoomsRegistered = true;
    return retry.rooms ?? [];
  }

  if (!response?.ok) {
    throw new Error(response?.message ?? "No se pudo registrar las colas del operador");
  }

  operatorRoomsRegistered = true;
  return response.rooms ?? [];
}

export async function joinPublicQueue(
  payload: PublicQueueJoinPayload,
  targetSocket: Socket = getSocket(),
): Promise<string> {
  await waitForSocketConnection(targetSocket);

  const response = await emitWithAck<PublicJoinAck>(
    targetSocket,
    "public:join",
    payload,
  );

  if (!response?.ok || !response.room) {
    throw new Error(response?.message ?? "No se pudo unir a la cola publica");
  }

  return response.room;
}

export function disconnectSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
  operatorRoomsRegistered = false;
  authReady = false;
}
