import { Schema, model } from 'mongoose';
import { MaintenanceRequest } from '../../types/maintenance';

const maintenanceRequestSchema = new Schema<MaintenanceRequest>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  images: [{
    type: String,
  }],
  ownerNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
maintenanceRequestSchema.index({ tenantId: 1, createdAt: -1 });
maintenanceRequestSchema.index({ propertyId: 1, status: 1 });
maintenanceRequestSchema.index({ status: 1, priority: 1 });

export const MaintenanceRequestModel = model<MaintenanceRequest>('MaintenanceRequest', maintenanceRequestSchema); 