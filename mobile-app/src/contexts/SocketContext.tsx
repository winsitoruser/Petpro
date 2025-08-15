import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import * as SecureStore from 'expo-secure-store';

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
  const [isConnected, setIsConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get authentication token
  useEffect(() => {
    async function getAuthToken() {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    getAuthToken();
  }, []);

  // Connect to socket when auth token is available
  useEffect(() => {
    if (authToken) {
      // Connect socket with JWT token
      socketService.connect(authToken);
      
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
  }, [authToken]);

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
