import { MaintenanceRequest, CreateMaintenanceRequestInput, UpdateMaintenanceRequestInput } from '../types/maintenance';
import api from './api';

export const maintenanceService = {
  createRequest: async (input: CreateMaintenanceRequestInput): Promise<MaintenanceRequest> => {
    try {
      const response = await api.post('/maintenance-requests', input);
      return response.data;
    } catch (error: any) {
      console.error('Create request error:', error);
      throw error;
    }
  },

  getRequests: async (): Promise<MaintenanceRequest[]> => {
    try {
      const response = await api.get('/maintenance-requests');
      return response.data;
    } catch (error: any) {
      console.error('Get requests error:', error);
      throw error;
    }
  },

  getRequestById: async (id: string): Promise<MaintenanceRequest> => {
    try {
      const response = await api.get(`/maintenance-requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get request by ID error:', error);
      throw error;
    }
  },

  updateRequest: async (id: string, input: UpdateMaintenanceRequestInput): Promise<MaintenanceRequest> => {
    try {
      const response = await api.patch(`/maintenance-requests/${id}`, input);
      return response.data;
    } catch (error: any) {
      console.error('Update request error:', error);
      throw error;
    }
  },

  getTenantRequests: async (): Promise<MaintenanceRequest[]> => {
    try {
      const response = await api.get('/maintenance-requests/tenant');
      // Map created_at and updated_at to camelCase
      const data = response.data.map((item: any) => ({
        ...item,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      console.log('API Response for tenant requests:', JSON.stringify(data, null, 2));
      return data;
    } catch (error: any) {
      console.error('Get tenant requests error:', error);
      throw error;
    }
  },

  getOwnerRequests: async (): Promise<MaintenanceRequest[]> => {
    try {
      const response = await api.get('/maintenance-requests/owner');
      // Map created_at and updated_at to camelCase
      const data = response.data.map((item: any) => ({
        ...item,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      return data;
    } catch (error: any) {
      console.error('Get owner requests error:', error);
      throw error;
    }
  },

  updateRequestStatus: async (id: string, status: string): Promise<MaintenanceRequest> => {
    try {
      console.log('Sending status update request:', { id, status });
      const response = await api.patch(`/maintenance-requests/${id}`, { status });
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update status error:', error.response?.data || error);
      throw error;
    }
  },

  approveRequest: async (id: string): Promise<MaintenanceRequest> => {
    try {
      const response = await api.patch(`/maintenance-requests/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error('Approve request error:', error);
      throw error;
    }
  },

  rejectRequest: async (id: string): Promise<MaintenanceRequest> => {
    try {
      const response = await api.post(`/maintenance-requests/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error('Reject request error:', error);
      throw error;
    }
  },
}; 