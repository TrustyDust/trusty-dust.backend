import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.query['userId'];
    if (typeof userId === 'string') {
      client.join(userId);
      this.logger.log(`Socket joined room ${userId}`);
    }
  }

  emit(userId: string, payload: any) {
    if (!this.server) {
      return;
    }
    this.server.to(userId).emit('notification', payload);
    this.server.emit('notification:public', { userId, payload });
    this.logger.debug(`Emitted notification events for user ${userId}`);
  }
}
