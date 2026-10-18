import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './chat.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client connected without token: ${client.id}`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET', 'change-this-to-a-random-64-char-string');
      const payload = this.jwtService.verify(token, { secret });
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Join user specific room for direct alerts
      client.join(`user:${client.userId}`);
      this.logger.log(`Client authenticated: ${client.id} (User: ${client.userId})`);
    } catch (err) {
      this.logger.error(`Socket auth error: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(`room:${data.roomId}`);
    return { status: 'joined', roomId: data.roomId };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`room:${data.roomId}`);
    return { status: 'left', roomId: data.roomId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; dto: SendMessageDto },
  ) {
    if (!client.userId) return;

    const message = await this.chatService.sendMessage(
      data.roomId,
      client.userId,
      data.dto,
    );

    // Broadcast to everyone in room including sender
    this.server.to(`room:${data.roomId}`).emit('new_message', {
      roomId: data.roomId,
      message,
    });

    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    client.to(`room:${data.roomId}`).emit('user_typing', {
      roomId: data.roomId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.userId) return;
    await this.chatService.markRoomAsRead(data.roomId, client.userId);
    client.to(`room:${data.roomId}`).emit('room_read', {
      roomId: data.roomId,
      userId: client.userId,
    });
  }
}
