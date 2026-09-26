// server/routes/posts.ts
import { Router } from 'express';
import {
  getPosts,
  createPost,
  likePost,
  commentPost,
  bookmarkPost,
  deletePost,
} from '../controllers/postController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.post('/', authenticateToken, createPost);
router.post('/:id/like', authenticateToken, likePost);
router.post('/:id/comment', authenticateToken, commentPost);
router.post('/:id/bookmark', authenticateToken, bookmarkPost);
router.delete('/:id', authenticateToken, deletePost);

export default router;
