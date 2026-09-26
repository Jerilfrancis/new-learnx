// server/services/socket.ts
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export let io: SocketIOServer | null = null;
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initSocketIO = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // Handle User Online Identification
    socket.on('register_user', (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.join(`user_${userId}`);
        io?.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // Join room (e.g., conversation room)
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    // Handle Direct Message
    socket.on(
      'send_message',
      (data: {
        conversationId?: string;
        recipientId: string;
        senderId: string;
        senderName?: string;
        senderAvatar?: string;
        content: string;
        attachment?: string;
      }) => {
        const messageObj = {
          id: 'msg_' + Date.now(),
          conversationId: data.conversationId || `conv_${Date.now()}`,
          senderId: data.senderId,
          senderName: data.senderName || 'Anonymous',
          senderAvatar:
            data.senderAvatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.senderId)}`,
          text: data.content,
          attachment: data.attachment,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        // Broadcast to recipient user room
        io?.to(`user_${data.recipientId}`).emit('receive_message', messageObj);
        // Also emit to conversation room if applicable
        if (data.conversationId) {
          io?.to(data.conversationId).emit('receive_message', messageObj);
        }
        // Echo back to sender
        socket.emit('message_sent', messageObj);
      }
    );

    // Typing Status
    socket.on('typing_start', (data: { recipientId: string; conversationId?: string; userId: string; userName?: string }) => {
      io?.to(`user_${data.recipientId}`).emit('user_typing', { ...data, isTyping: true });
    });

    socket.on('typing_stop', (data: { recipientId: string; conversationId?: string; userId: string }) => {
      io?.to(`user_${data.recipientId}`).emit('user_typing', { ...data, isTyping: false });
    });

    // Read Receipt
    socket.on('message_read', (data: { conversationId: string; senderId: string; messageId: string }) => {
      io?.to(`user_${data.senderId}`).emit('message_read_receipt', data);
    });

    socket.on('disconnect', () => {
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          break;
        }
      }
      io?.emit('online_users_list', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

/**
 * Emit real-time notification to a specific user
 */
export const emitNotification = (userId: string, notification: any) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('new_notification', notification);
};

/**
 * Broadcast event to all connected users
 */
export const broadcastEvent = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};
