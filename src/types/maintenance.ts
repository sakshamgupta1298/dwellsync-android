export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'closed';

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName?: string;
  tenantUniqueId?: string;
  propertyId?: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  images?: string[];
  notes?: string;
  isApprovedByTenant?: boolean;
  completedAt?: string;
  ownerNotes?: string;
}

export interface CreateMaintenanceRequestInput {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  images?: string[];
}

export interface UpdateMaintenanceRequestInput {
  status?: MaintenanceStatus;
  ownerNotes?: string;
} 