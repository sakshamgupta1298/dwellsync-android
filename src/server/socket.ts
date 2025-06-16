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
        console.log('Authenticating user:', user);
        // Verify user exists in database
        const dbUser = await UserModel.findById(user.userId);
        if (!dbUser) {
          console.log('User not found in database:', user.userId);
          socket.disconnect();
          return;
        }

        // Store user connection info
        connectedUsers.set(socket.id, {
          ...user,
          socketId: socket.id,
        });

        console.log('User authenticated successfully:', user);
        console.log('Current connected users:', Array.from(connectedUsers.values()));
      } catch (error) {
        console.error('Authentication error:', error);
        socket.disconnect();
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      connectedUsers.delete(socket.id);
      console.log('Remaining connected users:', Array.from(connectedUsers.values()));
    });
  });

  // Function to emit maintenance request updates
  const emitMaintenanceUpdate = async (request: MaintenanceRequest) => {
    try {
      console.log('Emitting maintenance update for request:', request);
      
      // Get the tenant's owner
      const tenant = await UserModel.findById(request.tenantId);
      if (!tenant) {
        console.log('Tenant not found:', request.tenantId);
        return;
      }
      console.log('Found tenant:', tenant);

      // Find all connected owners
      const ownerSockets = Array.from(connectedUsers.values())
        .filter(user => user.isOwner && user.userId === tenant.ownerId)
        .map(user => user.socketId);

      console.log('Found owner sockets:', ownerSockets);

      // Emit to specific owner sockets
      if (ownerSockets.length > 0) {
        const notification = {
          type: 'new_request',
          message: `New maintenance request from tenant ${tenant.name}: ${request.title}`,
          request,
        };
        console.log('Emitting notification to owners:', notification);
        io.to(ownerSockets).emit('maintenanceNotification', notification);
      } else {
        console.log('No connected owners found for tenant:', tenant.ownerId);
      }

      // Also emit to the tenant who created the request
      const tenantSocket = Array.from(connectedUsers.values())
        .find(user => !user.isOwner && user.userId === request.tenantId);
      
      if (tenantSocket) {
        const tenantNotification = {
          type: 'request_created',
          message: 'Your maintenance request has been submitted',
          request,
        };
        console.log('Emitting notification to tenant:', tenantNotification);
        io.to(tenantSocket.socketId).emit('maintenanceNotification', tenantNotification);
      } else {
        console.log('Tenant not connected:', request.tenantId);
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