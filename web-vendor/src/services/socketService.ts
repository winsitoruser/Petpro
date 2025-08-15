import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface BookingStatusUpdateEvent {
  bookingId: string;
  status: string;
  updatedAt: string;
  message?: string;
}

interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  bookingId?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private bookingListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Function[] = [];
  private isConnected: boolean = false;

  // Initialize socket connection with JWT token for authentication
  connect(token: string, apiUrl: string = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'http://localhost:3002') {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(`${apiUrl}/booking-events`, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      toast.success('Real-time updates connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      toast.warning('Real-time updates disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Unable to connect to real-time services');
    });

    // Booking status updates
    this.socket.on('booking-status-update', (data: BookingStatusUpdateEvent) => {
      console.log('Booking status update received:', data);
      
      // Notify specific booking listeners
      if (this.bookingListeners.has(data.bookingId)) {
        const listeners = this.bookingListeners.get(data.bookingId);
        listeners?.forEach(listener => listener(data));
      }
      
      // Show toast notification
      toast.info(`Booking #${data.bookingId.slice(0, 8)}: Status changed to ${data.status}`);
    });

    // General notifications
    this.socket.on('notification', (data: NotificationEvent) => {
      console.log('Notification received:', data);
      
      // Notify all notification listeners
      this.notificationListeners.forEach(listener => listener(data));
      
      // Show toast notification based on type
      switch(data.type) {
        case 'info':
          toast.info(data.message);
          break;
        case 'success':
          toast.success(data.message);
          break;
        case 'warning':
          toast.warning(data.message);
          break;
        case 'error':
          toast.error(data.message);
          break;
        default:
          toast.info(data.message);
      }
    });
  }

  // Join a booking-specific room to get updates for a particular booking
  joinBookingRoom(bookingId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('join-booking-room', { bookingId });
    console.log(`Joined booking room: ${bookingId}`);
  }

  // Leave a booking-specific room
  leaveBookingRoom(bookingId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('leave-booking-room', { bookingId });
    console.log(`Left booking room: ${bookingId}`);
  }

  // Subscribe to updates for a specific booking
  subscribeToBookingUpdates(bookingId: string, callback: Function) {
    if (!this.bookingListeners.has(bookingId)) {
      this.bookingListeners.set(bookingId, []);
    }
    
    this.bookingListeners.get(bookingId)?.push(callback);
    this.joinBookingRoom(bookingId);
    
    return () => {
      // Return unsubscribe function
      this.unsubscribeFromBookingUpdates(bookingId, callback);
    };
  }

  // Unsubscribe from updates for a specific booking
  unsubscribeFromBookingUpdates(bookingId: string, callback: Function) {
    const listeners = this.bookingListeners.get(bookingId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      
      // If no more listeners for this booking, leave the room
      if (listeners.length === 0) {
        this.leaveBookingRoom(bookingId);
        this.bookingListeners.delete(bookingId);
      }
    }
  }

  // Subscribe to general notifications
  subscribeToNotifications(callback: Function) {
    this.notificationListeners.push(callback);
    
    return () => {
      // Return unsubscribe function
      this.unsubscribeFromNotifications(callback);
    };
  }

  // Unsubscribe from general notifications
  unsubscribeFromNotifications(callback: Function) {
    const index = this.notificationListeners.indexOf(callback);
    if (index !== -1) {
      this.notificationListeners.splice(index, 1);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.bookingListeners.clear();
      this.notificationListeners = [];
    }
  }

  // Check if socket is currently connected
  isSocketConnected() {
    return this.isConnected;
  }
}

// Export as singleton instance
export const socketService = new SocketService();
export default socketService;
