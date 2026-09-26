// server/routes/courses.ts
import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
  updateCourseProgress,
  submitQuiz,
  generateCertificate,
  getCertificateById,
  getMyCertificates,
} from '../controllers/courseController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getCourses);
router.post('/', authenticateToken, createCourse);
router.get('/my-certificates', authenticateToken, getMyCertificates);
router.get('/certificate/:id', getCertificateById);
router.get('/:id', optionalAuth, getCourseById);
router.put('/:id', authenticateToken, updateCourse);
router.delete('/:id', authenticateToken, deleteCourse);
router.patch('/:id/publish', authenticateToken, publishCourse);
router.post('/:id/enroll', authenticateToken, enrollCourse);
router.post('/:id/progress', authenticateToken, updateCourseProgress);
router.post('/:id/quiz-submit', authenticateToken, submitQuiz);
router.post('/:courseId/certificate', authenticateToken, generateCertificate);

export default router;
