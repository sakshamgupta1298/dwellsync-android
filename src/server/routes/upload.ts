import { Router } from 'express';
import { upload, getFileUrl } from '../utils/fileUpload';
import { auth } from '../middleware/auth';

const router = Router();

// Upload single image
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req.file.filename);
    res.json({ imageUrl: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router; 