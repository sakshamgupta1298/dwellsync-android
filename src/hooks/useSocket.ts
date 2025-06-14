import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  useEffect(() => {
    // Connect to WebSocket when component mounts
    socketService.connect();

    // Disconnect when component unmounts
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    isConnected: socketService.isConnected(),
    isAuthenticated: socketService.isUserAuthenticated(),
    reconnectAttempts: socketService.getReconnectAttempts(),
  };
}; 