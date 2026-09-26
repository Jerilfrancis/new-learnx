// server/services/xpService.ts
import { XPEvent, XPActionType } from '../models/XPEvent';
import { User } from '../models/User';
import { isDbConnected } from '../config/mockStore';
import { emitNotification } from './socket';

const DEFAULT_XP_MAP: Record<XPActionType, number> = {
  COURSE_COMPLETION: 50,
  QUIZ_PASS: 20,
  PROJECT_SUBMISSION: 100,
  DAILY_LOGIN: 5,
  POST_LIKE: 2,
  MENTORSHIP_SESSION: 30,
  COMMUNITY_POST: 10,
};

export const awardXP = async (
  userId: string,
  action: XPActionType,
  referenceId?: string,
  customXP?: number
): Promise<{ success: boolean; xpEarned: number; totalXP: number; duplicate?: boolean }> => {
  const xpAmount = customXP ?? DEFAULT_XP_MAP[action] ?? 10;

  if (!isDbConnected()) {
    return { success: true, xpEarned: xpAmount, totalXP: 1250 + xpAmount };
  }

  try {
    // For DAILY_LOGIN, create unique referenceId for today: YYYY-MM-DD
    const finalRefId =
      action === 'DAILY_LOGIN'
        ? new Date().toISOString().split('T')[0]
        : referenceId || `gen_${Date.now()}`;

    // Try creating the XP event
    const event = new XPEvent({
      userId,
      action,
      xp: xpAmount,
      referenceId: finalRefId,
    });
    await event.save();

    // Increment user total XP
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: xpAmount, totalXp: xpAmount } },
      { new: true }
    );

    const totalXP = user?.xp || xpAmount;

    // Send real-time notification & event
    emitNotification(userId, {
      id: `notif_${Date.now()}`,
      type: 'XP_EARNED',
      title: `+${xpAmount} XP Earned!`,
      message: `You earned ${xpAmount} XP for ${action.replace(/_/g, ' ').toLowerCase()}.`,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return { success: true, xpEarned: xpAmount, totalXP };
  } catch (err: any) {
    if (err.code === 11000) {
      // Duplicate XP event prevented
      return { success: false, xpEarned: 0, totalXP: 0, duplicate: true };
    }
    console.error('Error awarding XP:', err);
    return { success: false, xpEarned: 0, totalXP: 0 };
  }
};
