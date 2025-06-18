import { Schema, model } from 'mongoose';

export interface IUser {
  id: string;
  name: string;
  email?: string;
  password?: string;
  is_owner: boolean;
  ownerId?: string;
  propertyId?: string;
  tenant_id?: string;
  rent_amount?: number;
  deposit?: number;
  propertyPhoto?: string;
  resetPasswordToken?: string;
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  resetPasswordToken: String,
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  is_owner: {
    type: Boolean,
    default: false,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
  },
  tenant_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  rent_amount: {
    type: Number,
    default: 0,
  },
  deposit: {
    type: Number,
    default: 0,
  },
  propertyPhoto: {
    type: String,
  },
}, {
  timestamps: true,
});

export const UserModel = model<IUser>('User', userSchema); 