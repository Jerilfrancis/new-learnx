// src/services/socketClient.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const SERVER_URL = window.location.origin;
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  s.emit('join_room', userId);
};

export const sendRealtimeMessage = (data: { recipientId: string; senderId: string; content: string }) => {
  const s = getSocket();
  s.emit('send_message', data);
};

export const onReceiveMessage = (callback: (message: any) => void) => {
  const s = getSocket();
  s.on('receive_message', callback);
  return () => {
    s.off('receive_message', callback);
  };
};
