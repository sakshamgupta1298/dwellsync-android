import { io, Socket } from 'socket.io-client';
import { MaintenanceRequest } from '../types/maintenance';
import { getToken } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private maintenanceListeners: ((request: MaintenanceRequest) => void)[] = [];
  private notificationListeners: ((notification: any) => void)[] = [];

  initialize() {
    if (this.socket) return;

    const token = getToken();
    if (!token) return;

    this.socket = io('http://liveinsync.in', {
      auth: {
        token,
      },
    });

    this.socket.on('connect', async () => {
      console.log('Socket connected');
      // Authenticate user after connection
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.socket?.emit('authenticate', {
            userId: user.id,
            isOwner: user.is_owner,
          });
        }
      } catch (error) {
        console.error('Error getting user from AsyncStorage:', error);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('maintenanceUpdate', (request: MaintenanceRequest) => {
      this.maintenanceListeners.forEach(listener => listener(request));
    });

    this.socket.on('maintenanceNotification', (notification) => {
      this.notificationListeners.forEach(listener => listener(notification));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMaintenanceUpdate(listener: (request: MaintenanceRequest) => void) {
    this.maintenanceListeners.push(listener);
    return () => {
      this.maintenanceListeners = this.maintenanceListeners.filter(l => l !== listener);
    };
  }

  onMaintenanceNotification(listener: (notification: any) => void) {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }
}

export const socketService = new SocketService(); 