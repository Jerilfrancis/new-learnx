// server/routes/upload.ts
import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/', authenticateToken, upload.single('file'), uploadFile);

export default router;
