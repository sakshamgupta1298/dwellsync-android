import { io, Socket } from 'socket.io-client';
import { MaintenanceRequest } from '../types/maintenance';
import { getToken } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private maintenanceListeners: ((request: MaintenanceRequest) => void)[] = [];
  private notificationListeners: ((notification: any) => void)[] = [];
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) {
      console.log('Socket already initialized');
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    console.log('Initializing socket connection...');
    this.socket = io('http://liveinsync.in', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', async () => {
      console.log('Socket connected successfully');
      try {
        const userStr = await AsyncStorage.getItem('user');
        console.log('Retrieved user from AsyncStorage:', userStr);
        
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('Emitting authenticate event with user:', user);
          this.socket?.emit('authenticate', {
            userId: user.id,
            isOwner: user.is_owner,
          });
        } else {
          console.error('No user data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error during socket authentication:', error);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    this.socket.on('maintenanceUpdate', (request: MaintenanceRequest) => {
      console.log('Received maintenance update:', request);
      this.maintenanceListeners.forEach(listener => {
        try {
          listener(request);
        } catch (error) {
          console.error('Error in maintenance update listener:', error);
        }
      });
    });

    this.socket.on('maintenanceNotification', (notification) => {
      console.log('Received maintenance notification:', notification);
      this.notificationListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    });

    this.isInitialized = true;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  onMaintenanceUpdate(listener: (request: MaintenanceRequest) => void) {
    console.log('Adding maintenance update listener');
    this.maintenanceListeners.push(listener);
    return () => {
      console.log('Removing maintenance update listener');
      this.maintenanceListeners = this.maintenanceListeners.filter(l => l !== listener);
    };
  }

  onMaintenanceNotification(listener: (notification: any) => void) {
    console.log('Adding maintenance notification listener');
    this.notificationListeners.push(listener);
    return () => {
      console.log('Removing maintenance notification listener');
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  // Helper method to check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService(); 