// server/routes/auth.ts
import { Router } from 'express';
import {
  register,
  login,
  oauth,
  googleAuthRedirect,
  googleAuthCallback,
  githubAuthRedirect,
  githubAuthCallback,
  verifyEmail,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
  completeOnboarding,
  updateProfile,
  changePassword,
  deleteAccount,
  getMe,
} from '../controllers/authController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', optionalAuth, getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/oauth', oauth);

// Real Google OAuth
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);

// Real GitHub OAuth
router.get('/github', githubAuthRedirect);
router.get('/github/callback', githubAuthCallback);

router.post('/verify-email', verifyEmail);
router.post('/verify-email-otp', verifyEmail);
router.post('/resend-otp', resendEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/onboarding', completeOnboarding);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);

export default router;
