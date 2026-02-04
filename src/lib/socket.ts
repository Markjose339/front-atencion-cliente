// lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔌 Intentando conectar a:', wsUrl); 
    
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'], 
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000, 
    });

    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket?.id);

      socket?.emit('join:tickets');
      console.log('📍 Solicitando unión al room tickets');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      console.error('URL intentada:', wsUrl);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}