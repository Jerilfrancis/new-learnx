// server/controllers/uploadController.ts
import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import net from 'net';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, SERVER_URL, CLIENT_URL } from '../config/env';
import { CLAMAV_HOST, CLAMAV_PORT } from '../config/env';

const hasCloudinary = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const scanWithClamAv = (buffer: Buffer): Promise<void> => new Promise((resolve, reject) => {
  const socket = net.createConnection({ host: CLAMAV_HOST, port: CLAMAV_PORT });
  let response = '';
  const timeout = setTimeout(() => {
    socket.destroy();
    reject(new Error('ClamAV scan timed out.'));
  }, 15000);
  socket.on('connect', () => {
    socket.write(Buffer.from('zINSTREAM\0'));
    const chunkSize = 1024 * 1024;
    for (let offset = 0; offset < buffer.length; offset += chunkSize) {
      const chunk = buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length));
      const header = Buffer.alloc(4);
      header.writeUInt32BE(chunk.length, 0);
      socket.write(header);
      socket.write(chunk);
    }
    const end = Buffer.alloc(4);
    socket.write(end);
  });
  socket.on('data', (data) => { response += data.toString(); });
  socket.on('error', (error) => { clearTimeout(timeout); reject(error); });
  socket.on('close', () => {
    clearTimeout(timeout);
    if (/FOUND/i.test(response)) return reject(new Error('File rejected: malware detected.'));
    if (/OK/i.test(response)) return resolve();
    reject(new Error('ClamAV returned an invalid scan response.'));
  });
});

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // Determine category
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype.startsWith('video/') || originalname.match(/\.(mp4|webm|mov)$/i);
    const isPdf = mimetype === 'application/pdf' || originalname.match(/\.pdf$/i);

    const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimetype);
    const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(mimetype);
    const allowedPdf = mimetype === 'application/pdf';
    if (!allowedImage && !allowedVideo && !allowedPdf) {
      return res.status(415).json({ success: false, message: 'Unsupported file type.' });
    }
    const maxSize = allowedPdf ? 20 * 1024 * 1024 : allowedImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (size > maxSize) {
      return res.status(413).json({ success: false, message: `File exceeds the ${Math.round(maxSize / 1024 / 1024)} MB limit.` });
    }

    try {
      await scanWithClamAv(buffer);
    } catch (scanError: any) {
      return res.status(503).json({ success: false, message: scanError.message || 'Upload scanner unavailable.' });
    }

    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    let folder = 'code_infinite/general';

    if (isImage) {
      resourceType = 'image';
      folder = 'code_infinite/images';
    } else if (isVideo) {
      resourceType = 'video';
      folder = 'code_infinite/videos';
    } else if (isPdf) {
      resourceType = 'raw';
      folder = 'code_infinite/documents';
    }

    // Try Cloudinary first if configured
    if (hasCloudinary) {
      try {
        const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: resourceType,
              public_id: `${Date.now()}_${path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result?.secure_url) return reject(new Error('Cloudinary failed to return a secure URL'));
              resolve({ secure_url: result.secure_url });
            }
          );
          stream.end(buffer);
        });

        const uploadRes = await uploadPromise;

        return res.json({
          success: true,
          url: uploadRes.secure_url,
          fileName: originalname,
          mimeType: mimetype,
          fileSize: size,
          resourceType: isVideo ? 'video' : isPdf ? 'pdf' : 'image',
        });
      } catch (cloudErr: any) {
        console.warn('Cloudinary upload warning (falling back to local storage):', cloudErr.message);
      }
    }

    // Local Disk Fallback
    const safeName = `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = SERVER_URL || CLIENT_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${safeName}`;

    return res.json({
      success: true,
      url: fileUrl,
      fileName: originalname,
      mimeType: mimetype,
      fileSize: size,
      resourceType: isVideo ? 'video' : isPdf ? 'pdf' : 'image',
    });
  } catch (err: any) {
    next(err);
  }
};
