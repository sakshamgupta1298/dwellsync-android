import { Router } from 'express';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest';
import { auth } from '../middleware/auth';
import { isOwner } from '../middleware/isOwner';
import { isTenant } from '../middleware/isTenant';
import { emitMaintenanceUpdate } from '../socket';

const router = Router();

// Create a new maintenance request (tenant only)
router.post('/', auth, isTenant, async (req, res) => {
  try {
    const { title, description, priority, images } = req.body;
    const tenantId = req.user._id;
    const propertyId = req.user.propertyId;

    const maintenanceRequest = new MaintenanceRequestModel({
      tenantId,
      propertyId,
      title,
      description,
      priority,
      images,
    });

    await maintenanceRequest.save();
    
    // Emit socket notification
    emitMaintenanceUpdate(maintenanceRequest);
    
    res.status(201).json(maintenanceRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all maintenance requests (owner only)
router.get('/owner', auth, isOwner, async (req, res) => {
  try {
    const requests = await MaintenanceRequestModel.find()
      .populate('tenantId', 'name email')
      .populate('propertyId', 'address')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tenant's maintenance requests
router.get('/tenant', auth, isTenant, async (req, res) => {
  try {
    const requests = await MaintenanceRequestModel.find({ tenantId: req.user._id })
      .populate('propertyId', 'address')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific maintenance request
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await MaintenanceRequestModel.findById(req.params.id)
      .populate('tenantId', 'name email')
      .populate('propertyId', 'address');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Check if user has permission to view this request
    if (!req.user.is_owner && request.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update maintenance request status (owner only)
router.patch('/:id', auth, isOwner, async (req, res) => {
  try {
    const { status, ownerNotes } = req.body;
    const request = await MaintenanceRequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    if (status) request.status = status;
    if (ownerNotes) request.ownerNotes = ownerNotes;

    await request.save();
    
    // Emit socket notification
    emitMaintenanceUpdate(request);
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 