import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BookingStatus } from '../../models/booking.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface BookingStatusUpdatePayload {
  bookingId: string;
  status: BookingStatus;
  updatedAt: Date;
  message?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with specific origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'booking-events',
})
export class BookingEventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private readonly logger = new Logger(BookingEventsGateway.name);
  private userSocketMap = new Map<string, string[]>(); // userId -> socketIds[]

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Booking events WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove socket from userSocketMap
    this.userSocketMap.forEach((socketIds, userId) => {
      const index = socketIds.indexOf(client.id);
      if (index !== -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.userSocketMap.delete(userId);
        }
        this.logger.log(`Removed socket ${client.id} from user ${userId}`);
      }
    });
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: Socket, token: string): WsResponse<{ authenticated: boolean }> {
    try {
      // Verify JWT token
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = decoded.sub;
      
      // Store the association between user and socket
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      
      const userSockets = this.userSocketMap.get(userId);
      if (!userSockets.includes(client.id)) {
        userSockets.push(client.id);
      }
      
      this.logger.log(`User ${userId} authenticated on socket ${client.id}`);

      // Set user data on the socket for future reference
      client.data.user = {
        id: userId,
        role: decoded.role,
      };

      return { event: 'authenticated', data: { authenticated: true } };
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      return { event: 'authenticated', data: { authenticated: false } };
    }
  }

  @SubscribeMessage('join-booking-room')
  handleJoinBookingRoom(client: Socket, bookingId: string): void {
    // Ensure user is authenticated
    if (!client.data.user) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }
    
    // Join booking-specific room
    const roomName = `booking:${bookingId}`;
    client.join(roomName);
    this.logger.log(`User ${client.data.user.id} joined room ${roomName}`);
    
    client.emit('joined-room', { bookingId, room: roomName });
  }

  @SubscribeMessage('leave-booking-room')
  handleLeaveBookingRoom(client: Socket, bookingId: string): void {
    const roomName = `booking:${bookingId}`;
    client.leave(roomName);
    this.logger.log(`User ${client.data.user?.id || 'Unknown'} left room ${roomName}`);
  }

  // Method to be called from the booking service to emit status updates
  emitBookingStatusUpdate(payload: BookingStatusUpdatePayload): void {
    const roomName = `booking:${payload.bookingId}`;
    
    this.server.to(roomName).emit('booking-status-update', payload);
    this.logger.log(`Emitted booking status update to room ${roomName}: ${JSON.stringify(payload)}`);
  }

  // Send notification to specific user(s)
  sendNotificationToUser(userId: string, notification: any): void {
    const socketIds = this.userSocketMap.get(userId);
    
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
      this.logger.log(`Sent notification to user ${userId}`);
    } else {
      this.logger.warn(`User ${userId} not connected, notification queued for later delivery`);
      // Here you could implement a queue system to deliver when user connects
    }
  }
}
