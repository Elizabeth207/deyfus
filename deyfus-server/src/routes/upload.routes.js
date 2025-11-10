import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = Router();

// POST / -> single file upload (field name: file)
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Build public url to the uploaded file
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ message: 'File uploaded', url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error uploading file', error: err.message });
  }
});

export default router;
