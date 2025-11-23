import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query['userId'];
    if (typeof userId === 'string') {
      client.join(userId);
    }
  }

  emit(userId: string, payload: any) {
    if (!this.server) {
      return;
    }
    this.server.to(userId).emit('notification', payload);
    this.server.emit('notification:public', { userId, payload });
  }
}
