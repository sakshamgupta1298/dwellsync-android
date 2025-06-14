import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { MaintenanceRequest } from '../types/maintenance';
import { UserModel } from '../models/User';

interface SocketUser {
  userId: string;
  isOwner: boolean;
  socketId: string;
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
    socket.on('authenticate', async (user: SocketUser) => {
      try {
        // Verify user exists in database
        const dbUser = await UserModel.findById(user.userId);
        if (!dbUser) {
          socket.disconnect();
          return;
        }

        // Store user connection info
        connectedUsers.set(socket.id, {
          ...user,
          socketId: socket.id,
        });

        console.log('User authenticated:', user);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.disconnect();
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  // Function to emit maintenance request updates
  const emitMaintenanceUpdate = async (request: MaintenanceRequest) => {
    try {
      // Get the tenant's owner
      const tenant = await UserModel.findById(request.tenantId);
      if (!tenant) return;

      // Find all connected owners
      const ownerSockets = Array.from(connectedUsers.values())
        .filter(user => user.isOwner && user.userId === tenant.ownerId)
        .map(user => user.socketId);

      // Emit to specific owner sockets
      if (ownerSockets.length > 0) {
        io.to(ownerSockets).emit('maintenanceNotification', {
          type: 'new_request',
          message: `New maintenance request from tenant ${tenant.name}: ${request.title}`,
          request,
        });
      }

      // Also emit to the tenant who created the request
      const tenantSocket = Array.from(connectedUsers.values())
        .find(user => !user.isOwner && user.userId === request.tenantId);
      
      if (tenantSocket) {
        io.to(tenantSocket.socketId).emit('maintenanceNotification', {
          type: 'request_created',
          message: 'Your maintenance request has been submitted',
          request,
        });
      }
    } catch (error) {
      console.error('Error emitting maintenance update:', error);
    }
  };

  return {
    io,
    emitMaintenanceUpdate,
  };
}; 