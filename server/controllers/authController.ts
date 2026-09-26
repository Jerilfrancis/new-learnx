// server/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockUsers } from '../config/mockStore';
import { VerificationOTP } from '../models/VerificationOTP';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { Resend } from 'resend';
import {
  RESEND_API_KEY,
  EMAIL_FROM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  CLIENT_URL,
} from '../config/env';

const resend = new Resend(RESEND_API_KEY);

const generateTokens = (userId: string, role: string, email: string) => {
  const payload = { id: userId, role, email };
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured.');
  }
  const secret = JWT_SECRET;
  const refreshSecret = JWT_REFRESH_SECRET;
  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const googleAuthRedirect = (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: 'Google OAuth is not configured.' });
  }
  const callbackUrl = GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const clientId = GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(callbackUrl);
  const scope = encodeURIComponent('email profile openid');
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(googleUrl);
};

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const clientAppUrl = CLIENT_URL || `${req.protocol}://${req.get('host')}`;

    if (!code) {
      return res.redirect(`${clientAppUrl}?error=google_auth_failed`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${clientAppUrl}?error=google_oauth_not_configured`);
    }

    // Exchange code with Google
    const callbackUrl = GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData: any = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(`${clientAppUrl}?error=invalid_token`);
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo: any = await userInfoRes.json();

    const email = userInfo.email || 'user@google.com';
    const name = userInfo.name || 'Google User';
    const avatar = userInfo.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    let userRole = 'STUDENT';
    let userId = 'usr_' + Date.now();

    if (isDbConnected()) {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        const handle = (name || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
        const dummyHash = await bcrypt.hash('oauth_' + Date.now(), 10);
        user = new User({
          email: email.toLowerCase(),
          passwordHash: dummyHash,
          name,
          handle,
          role: 'STUDENT',
          avatar,
          bio: 'Authenticated with Google.',
          totalXp: 200,
          emailVerified: true,
          onboardingCompleted: true,
          skills: ['Web Development'],
        });
        await user.save();
      } else {
        user.emailVerified = true;
        await user.save();
      }
      userId = user._id.toString();
      userRole = user.role;
    }

    const tokens = generateTokens(userId, userRole, email);
    return res.redirect(`${clientAppUrl}?token=${tokens.accessToken}&role=${userRole}&name=${encodeURIComponent(name)}`);
  } catch (err) {
    next(err);
  }
};

export const githubAuthRedirect = (req: Request, res: Response) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: 'GitHub OAuth is not configured.' });
  }
  const callbackUrl = GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
  const clientId = GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(callbackUrl);
  const scope = encodeURIComponent('user:email read:user');
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(githubUrl);
};

export const githubAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const clientAppUrl = CLIENT_URL || `${req.protocol}://${req.get('host')}`;

    if (!code) {
      return res.redirect(`${clientAppUrl}?error=github_auth_failed`);
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.redirect(`${clientAppUrl}?error=github_oauth_not_configured`);
    }

    // Exchange code with GitHub
    const callbackUrl = GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl,
      }),
    });
    const tokenData: any = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(`${clientAppUrl}?error=invalid_token`);
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Code-Infinite-App',
      },
    });
    const ghUser: any = await userRes.json();

    // Fetch emails
    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Code-Infinite-App',
        },
      });
      const emails: any = await emailRes.json();
      if (Array.isArray(emails) && emails.length > 0) {
        const primary = emails.find((e: any) => e.primary) || emails[0];
        email = primary.email;
      }
    }
    email = email || `${ghUser.login || 'github_user'}@users.noreply.github.com`;
    const name = ghUser.name || ghUser.login || 'GitHub Developer';
    const avatar = ghUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    let userRole = 'STUDENT';
    let userId = 'usr_' + Date.now();

    if (isDbConnected()) {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        const handle = (ghUser.login || 'gh_dev').toLowerCase().replace(/\s+/g, '_');
        const dummyHash = await bcrypt.hash('oauth_' + Date.now(), 10);
        user = new User({
          email: email.toLowerCase(),
          passwordHash: dummyHash,
          name,
          handle,
          role: 'STUDENT',
          avatar,
          bio: ghUser.bio || 'Authenticated with GitHub.',
          totalXp: 200,
          emailVerified: true,
          onboardingCompleted: true,
          skills: ['Git', 'TypeScript', 'Node.js'],
        });
        await user.save();
      } else {
        user.emailVerified = true;
        await user.save();
      }
      userId = user._id.toString();
      userRole = user.role;
    }

    const tokens = generateTokens(userId, userRole, email);
    return res.redirect(`${clientAppUrl}?token=${tokens.accessToken}&role=${userRole}&name=${encodeURIComponent(name)}`);
  } catch (err) {
    next(err);
  }
};


export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, user: mockUsers[0] });
    }

    const userId = req.user?.id;
    let user;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({});
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Signup is unavailable.' });
    }
    if (!RESEND_API_KEY) {
      return res.status(503).json({ success: false, message: 'Email delivery is not configured. Signup is unavailable.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const handle = name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      name,
      handle,
      role: role || 'STUDENT',
      avatar,
      bio: 'Member at LearnX.',
      totalXp: 100,
      emailVerified: false,
      onboardingCompleted: false,
    });
    await user.save();

    // Generate real 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Save to DB (expires in 10 minutes automatically via schema index)
    await VerificationOTP.create({
      email: user.email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send real email via Resend
    if (RESEND_API_KEY) {
      await resend.emails.send({
        from: EMAIL_FROM || 'onboarding@resend.dev',
        to: user.email,
        subject: 'Verify your LearnX account',
        html: `<p>Hello ${user.name},</p><p>Your LearnX verification OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes.</p><p>LearnX<br>Learn • Connect • Build</p>`,
      });
    }

    return res.json({
      success: true,
      user,
      message: `Verification code sent to ${user.email}.`,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected. Login is unavailable.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid && password !== user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      user.role = role;
      await user.save();
    }

    const tokens = generateTokens(user._id.toString(), user.role, user.email);

    return res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (err) {
    next(err);
  }
};

export const oauth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, email, name, avatar, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for OAuth login.' });
    }

    if (!isDbConnected()) {
      let user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          _id: 'usr_' + Date.now(),
          id: 'usr_' + Date.now(),
          email: email.toLowerCase(),
          passwordHash: '',
          name: name || 'OAuth Member',
          handle: (name || 'user').toLowerCase().replace(/\s+/g, '_'),
          role: role || 'STUDENT',
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          bio: `Authenticated via ${provider || 'OAuth'}.`,
          totalXp: 200,
          emailVerified: true,
          onboardingCompleted: true,
          skills: ['Web Development'],
          createdCoursesCount: 0,
          completedCoursesCount: 0,
          followersCount: 0,
          followingCount: 0,
        };
        mockUsers.push(user);
      }
      const tokens = generateTokens(user.id, user.role, user.email);
      return res.json({ success: true, token: tokens.accessToken, user });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const handle = (name || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
      const userAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
      const dummyPasswordHash = await bcrypt.hash('oauth_' + Date.now(), 10);

      user = new User({
        email: email.toLowerCase(),
        passwordHash: dummyPasswordHash,
        name: name || 'OAuth Member',
        handle,
        role: role || 'STUDENT',
        avatar: userAvatar,
        bio: `Authenticated via ${provider || 'OAuth'}.`,
        totalXp: 200,
        emailVerified: true,
        onboardingCompleted: true,
        skills: ['Web Development'],
      });
      await user.save();
    } else {
      user.emailVerified = true;
      if (role) user.role = role;
      await user.save();
    }

    const tokens = generateTokens(user._id.toString(), user.role, user.email);

    return res.json({
      success: true,
      token: tokens.accessToken,
      user,
      message: `Successfully authenticated with ${provider || 'OAuth'}`,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email and OTP token are required.' });
    }

    const otpRecord = await VerificationOTP.findOne({ email: email.toLowerCase() });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    if (otpRecord.attempts >= 5) {
      await VerificationOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const isValid = await bcrypt.compare(token, otpRecord.otpHash);
    
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // OTP is valid
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.emailVerified = true;
    await user.save();
    
    // Delete OTP record
    await VerificationOTP.deleteOne({ _id: otpRecord._id });

    // Generate tokens for login
    const tokens = generateTokens(user._id.toString(), user.role, user.email);

    return res.json({ 
      success: true, 
      token: tokens.accessToken,
      user, 
      message: 'Email verified successfully!' 
    });
  } catch (err) {
    next(err);
  }
};

export const resendEmailOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email is already verified.' });

    // Check for recent OTP to prevent spam (cooldown of 60s)
    const existingOtp = await VerificationOTP.findOne({ email: user.email });
    if (existingOtp) {
      const secondsSinceCreation = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        return res.status(429).json({ success: false, message: `Please wait ${Math.ceil(60 - secondsSinceCreation)} seconds before requesting a new OTP.` });
      }
      // Delete old OTP
      await VerificationOTP.deleteOne({ _id: existingOtp._id });
    }

    // Generate real 6-digit OTP
    if (!RESEND_API_KEY) {
      return res.status(503).json({ success: false, message: 'Email delivery is not configured.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await VerificationOTP.create({
      email: user.email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (RESEND_API_KEY) {
      await resend.emails.send({
        from: EMAIL_FROM || 'onboarding@resend.dev',
        to: user.email,
          subject: 'Your new LearnX verification OTP',
        html: `<p>Hello ${user.name},</p><p>Your new verification OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
      });
    }

    return res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    // Always return the same response to avoid email enumeration
    if (!isDbConnected()) {
      return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Delete old tokens and create new one
      await PasswordResetToken.deleteMany({ email: user.email });
      await PasswordResetToken.create({
        email: user.email,
        tokenHash: resetTokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      if (RESEND_API_KEY) {
        await resend.emails.send({
          from: EMAIL_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: 'Reset your LearnX password',
          html: `<p>Hello ${user.name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`,
        });
      }
    }

    return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, token, password, newPassword } = req.body;
    const requestedPassword = password || newPassword;
    if (!email || !token || !requestedPassword) {
      return res.status(400).json({ success: false, message: 'Email, token, and new password are required.' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, message: 'Password updated successfully. You can now login.' });
    }

    const resetRecord = await PasswordResetToken.findOne({ email: email.toLowerCase() });
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const isValid = await bcrypt.compare(token, resetRecord.tokenHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.passwordHash = await bcrypt.hash(requestedPassword, 10);
    await user.save();

    // Invalidate the reset token
    await PasswordResetToken.deleteMany({ email: user.email });

    return res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    next(err);
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { interests, avatar } = req.body;
    const userId = req.user?.id;

    if (!isDbConnected()) {
      const user = mockUsers[0];
      user.onboardingCompleted = true;
      if (interests && Array.isArray(interests)) {
        user.skills = Array.from(new Set([...user.skills, ...interests]));
      }
      if (avatar) user.avatar = avatar;
      return res.json({ success: true, user });
    }

    const user = userId ? await User.findById(userId) : await User.findOne({});
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.onboardingCompleted = true;
    if (interests && Array.isArray(interests)) {
      user.skills = Array.from(new Set([...(user.skills || []), ...interests]));
    }
    if (avatar) user.avatar = avatar;
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profileData = req.body;
    if (!isDbConnected()) {
      Object.assign(mockUsers[0], profileData);
      return res.json({ success: true, user: mockUsers[0] });
    }
    const user = (req.user?.id ? await User.findById(req.user.id) : null) || (await User.findOne({}));
    if (user) {
      Object.assign(user, profileData);
      await user.save();
      return res.json({ success: true, user });
    }
    return res.status(400).json({ success: false, message: 'User not found' });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, message: 'Password updated successfully' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (currentPassword && user.passwordHash) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, message: 'Account deleted successfully' });
    }

    await User.findByIdAndDelete(userId);
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

