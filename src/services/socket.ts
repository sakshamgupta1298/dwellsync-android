import { io, Socket } from 'socket.io-client';
import { MaintenanceRequest } from '../types/maintenance';
import { getToken } from '../utils/auth';

class SocketService {
  private socket: Socket | null = null;
  private maintenanceListeners: ((request: MaintenanceRequest) => void)[] = [];

  initialize() {
    if (this.socket) return;

    const token = getToken();
    if (!token) return;

    this.socket = io('http://www.liveinsync.in:3000', {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('maintenanceUpdate', (request: MaintenanceRequest) => {
      this.maintenanceListeners.forEach(listener => listener(request));
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
}

export const socketService = new SocketService(); 