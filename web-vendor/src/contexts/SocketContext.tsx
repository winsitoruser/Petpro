import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import { useSession } from 'next-auth/react';

// Extended Session type that includes accessToken
interface ExtendedSession {
  user?: any;
  accessToken?: string;
  expires: string;
}

// Define context shape
interface SocketContextType {
  isConnected: boolean;
  joinBookingRoom: (bookingId: string) => void;
  leaveBookingRoom: (bookingId: string) => void;
  subscribeToBookingUpdates: (bookingId: string, callback: Function) => Function;
  subscribeToNotifications: (callback: Function) => Function;
}

// Create the context with default values
const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  joinBookingRoom: () => {},
  leaveBookingRoom: () => {},
  subscribeToBookingUpdates: () => () => {},
  subscribeToNotifications: () => () => {},
});

// Socket provider props
interface SocketProviderProps {
  children: ReactNode;
}

// Socket provider component
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;
  const [isConnected, setIsConnected] = useState(false);

  // Connect to socket when session is available
  useEffect(() => {
    if (extendedSession?.user && extendedSession.accessToken) {
      // Connect socket with JWT token
      socketService.connect(extendedSession.accessToken);
      
      // Check connection status periodically
      const intervalId = setInterval(() => {
        setIsConnected(socketService.isSocketConnected());
      }, 5000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(intervalId);
        socketService.disconnect();
      };
    }
  }, [extendedSession]);

  // Value to be provided by the context
  const contextValue = {
    isConnected: isConnected,
    joinBookingRoom: (bookingId: string) => socketService.joinBookingRoom(bookingId),
    leaveBookingRoom: (bookingId: string) => socketService.leaveBookingRoom(bookingId),
    subscribeToBookingUpdates: (bookingId: string, callback: Function) => 
      socketService.subscribeToBookingUpdates(bookingId, callback),
    subscribeToNotifications: (callback: Function) => 
      socketService.subscribeToNotifications(callback),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => useContext(SocketContext);

export default SocketContext;
