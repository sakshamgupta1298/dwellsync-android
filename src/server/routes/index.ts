import { Router } from 'express';
import maintenanceRoutes from './maintenance';
import authRoutes from './auth';
import userRoutes from './user';
import propertyRoutes from './property';
import uploadRoutes from './upload';
import passwordResetRoutes from './passwordReset';

const router = Router();

// Register all routes
router.use('/maintenance-requests', maintenanceRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/upload', uploadRoutes);
router.use('/auth', passwordResetRoutes); // Password reset routes are also under /auth

export default router; 