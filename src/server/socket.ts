import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { MaintenanceRequest } from '../types/maintenance';

interface SocketUser {
  userId: string;
  isOwner: boolean;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Store connected users
  const connectedUsers = new Map<string, SocketUser>();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (user: SocketUser) => {
      connectedUsers.set(socket.id, user);
      console.log('User authenticated:', user);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  // Function to emit maintenance request updates
  const emitMaintenanceUpdate = (request: MaintenanceRequest) => {
    io.emit('maintenanceUpdate', request);

    // Notify specific users based on the update
    connectedUsers.forEach((user, socketId) => {
      if (
        (user.isOwner && request.status === 'pending') ||
        (!user.isOwner && user.userId === request.tenantId)
      ) {
        io.to(socketId).emit('maintenanceNotification', {
          type: 'maintenance',
          message: `Maintenance request "${request.title}" has been ${request.status}`,
          request,
        });
      }
    });
  };

  return {
    io,
    emitMaintenanceUpdate,
  };
}; 