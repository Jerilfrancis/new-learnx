// server/controllers/bountyController.ts
import { Response, NextFunction } from 'express';
import { CodeBounty } from '../models/CodeBounty';
import { AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpService';
import { isDbConnected } from '../config/mockStore';

export const getBounties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    if (!isDbConnected()) {
      const mockBounties = [
        {
          _id: 'bounty_1',
          id: 'bounty_1',
          title: 'Memory leak in React useEffect WebSocket listener',
          description: 'Our real-time canvas drops frame rate after 5 minutes because event listeners are not cleaning up properly.',
          codeSnippet: `useEffect(() => {\n  const ws = new WebSocket("wss://canvas.live");\n  ws.onmessage = (e) => setFrames(prev => [...prev, e.data]);\n}, [room]);`,
          language: 'typescript',
          bountyXp: 150,
          authorName: 'Alex Vance',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          status: 'open',
          solutions: [],
          createdAt: new Date(),
        },
        {
          _id: 'bounty_2',
          id: 'bounty_2',
          title: 'Optimize SQL recursive query for hierarchy trees',
          description: 'Looking for a clean CTE query to fetch all ancestor categories in Postgres with index optimization.',
          codeSnippet: `WITH RECURSIVE CategoryTree AS (\n  SELECT id, parent_id, name FROM categories WHERE id = 42\n  UNION ALL\n  SELECT c.id, c.parent_id, c.name FROM categories c JOIN CategoryTree ct ON c.id = ct.parent_id\n) SELECT * FROM CategoryTree;`,
          language: 'sql',
          bountyXp: 200,
          authorName: 'Sarah Jenkins',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          status: 'solved',
          solutions: [
            {
              id: 'sol_1',
              solverName: 'Marcus Chen',
              solverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              reviewText: 'Added indexed path materialized view with ltree extension for O(1) ancestor lookups.',
              isAccepted: true,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      ];
      return res.json({ success: true, bounties: status ? mockBounties.filter((b) => b.status === status) : mockBounties });
    }

    const query: any = {};
    if (status) query.status = status;

    const bounties = await CodeBounty.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, bounties });
  } catch (err) {
    next(err);
  }
};

export const createBounty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, codeSnippet, language, bountyXp } = req.body;
    const authorId = req.user?.id || 'usr_1';
    const authorName = req.user?.email ? req.user.email.split('@')[0] : 'Engineer';
    const authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

    if (!title || !description || !codeSnippet) {
      return res.status(400).json({ success: false, message: 'Title, description, and code snippet are required.' });
    }

    const bountyData = {
      title,
      description,
      codeSnippet,
      language: language || 'typescript',
      bountyXp: Number(bountyXp) || 100,
      authorId,
      authorName,
      authorAvatar,
      status: 'open',
      solutions: [],
    };

    if (!isDbConnected()) {
      return res.status(201).json({ success: true, bounty: { _id: `bounty_${Date.now()}`, ...bountyData } });
    }

    const bounty = new CodeBounty(bountyData);
    await bounty.save();

    return res.status(201).json({ success: true, bounty, message: 'XP Bounty created and posted to board!' });
  } catch (err) {
    next(err);
  }
};

export const submitSolution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reviewText, codeSolution } = req.body;
    const solverId = req.user?.id || 'usr_2';
    const solverName = req.user?.email ? req.user.email.split('@')[0] : 'Reviewer';
    const solverAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(solverName)}`;

    if (!reviewText) {
      return res.status(400).json({ success: false, message: 'Review text explanation is required.' });
    }

    const solutionObj = {
      id: `sol_${Date.now()}`,
      solverId,
      solverName,
      solverAvatar,
      reviewText,
      codeSolution,
      isAccepted: false,
      createdAt: new Date(),
    };

    if (!isDbConnected()) {
      return res.json({ success: true, solution: solutionObj, message: 'Review submitted successfully.' });
    }

    const bounty = await CodeBounty.findById(id);
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found.' });

    bounty.solutions.push(solutionObj as any);
    await bounty.save();

    return res.json({ success: true, solution: solutionObj, message: 'Review submitted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const acceptSolution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, solutionId } = req.params;

    if (!isDbConnected()) {
      return res.json({ success: true, message: 'Solution accepted! Bounty XP transferred to solver.' });
    }

    const bounty = await CodeBounty.findById(id);
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found.' });

    const solution = bounty.solutions.find((s) => s.id === solutionId);
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    solution.isAccepted = true;
    bounty.status = 'solved';
    await bounty.save();

    // Award Bounty XP to Solver
    await awardXP(solution.solverId, 'PROJECT_SUBMISSION', id, bounty.bountyXp);

    return res.json({ success: true, message: `Solution accepted! ${bounty.bountyXp} XP awarded to solver.` });
  } catch (err) {
    next(err);
  }
};
