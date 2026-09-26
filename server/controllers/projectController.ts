// server/controllers/projectController.ts
import { Response, NextFunction } from 'express';
import { Project, Submission } from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockProjects, mockSubmissions } from '../config/mockStore';
import { awardXP } from '../services/xpService';

/**
 * Verify GitHub repository details via public GitHub API
 */
const verifyGitHubRepo = async (githubUrl: string) => {
  try {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return { valid: false, error: 'Invalid GitHub repository URL format' };

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'CodeInfinite-Ecosystem/1.0',
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `GitHub repository "${owner}/${repo}" is private or does not exist (${response.status}).`,
      };
    }

    const data: any = await response.json();
    const ciScore = Math.min(100, 70 + (data.stargazers_count > 0 ? 10 : 5) + (data.has_issues ? 10 : 5) + 5);

    return {
      valid: true,
      repoName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      ciScore,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to connect to GitHub API' };
  }
};

export const getProjects = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, projects: mockProjects });
    }
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, difficulty, tags, deadline, maxTeamSize, rewardXp, repositoryUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    if (!isDbConnected()) {
      const project = {
        _id: 'proj_' + Date.now(),
        id: 'proj_' + Date.now(),
        title,
        description,
        category: category || 'Full-Stack',
        difficulty: difficulty || 'Intermediate',
        tags: tags || ['React', 'Node.js'],
        starsCount: 0,
        submissionsCount: 0,
        deadline: deadline || '2026-12-31',
        maxTeamSize: Number(maxTeamSize) || 4,
        rewardXp: Number(rewardXp) || 500,
        repositoryUrl: repositoryUrl || '',
        createdAt: new Date(),
      };
      mockProjects.unshift(project);
      return res.status(201).json({ success: true, project, message: 'Project created successfully' });
    }

    const project = new Project({
      title,
      description,
      category: category || 'Full-Stack',
      difficulty: difficulty || 'Intermediate',
      tags: tags || ['React', 'Node.js'],
      deadline: deadline || '2026-12-31',
      maxTeamSize: Number(maxTeamSize) || 4,
      rewardXp: Number(rewardXp) || 500,
      repositoryUrl: repositoryUrl || '',
      creatorId: req.user?.id,
    });
    await project.save();

    return res.status(201).json({ success: true, project, message: 'Project created successfully' });
  } catch (err) {
    next(err);
  }
};

export const submitProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { githubUrl, demoUrl, description, attachments } = req.body;
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!githubUrl) return res.status(400).json({ success: false, message: 'A GitHub repository URL is required.' });

    let githubDetails: any = null;

    const ghCheck = await verifyGitHubRepo(githubUrl);
    if (!ghCheck.valid) {
      return res.status(422).json({ success: false, message: ghCheck.error || 'GitHub repository verification failed.' });
    }
    githubDetails = ghCheck;

    const submission = {
      projectId: id,
      authorId: studentId,
      authorName: req.user?.email ? req.user.email.split('@')[0] : 'Alex Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      authorRole: 'STUDENT',
      githubUrl,
      demoUrl: demoUrl || '',
      description: description || '',
      attachments: attachments || [],
      status: 'pending',
      submittedAt: new Date(),
      upvotes: 1,
      ciScore: githubDetails.ciScore,
      githubDetails,
    };

    // Award +100 XP for project challenge submission
    await awardXP(studentId, 'PROJECT_SUBMISSION', id);

    if (!isDbConnected()) {
      mockSubmissions.unshift(submission);
      return res.json({ success: true, submission, ciScore: githubDetails.ciScore });
    }

    const subDoc = new Submission(submission);
    await subDoc.save();

    // Increment project submissions count
    await Project.findByIdAndUpdate(id, { $inc: { submissionsCount: 1 } });

    return res.json({ success: true, submission, ciScore: githubDetails.ciScore });
  } catch (err) {
    next(err);
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    if (!isDbConnected()) {
      const submissions = projectId
        ? mockSubmissions.filter((s) => s.projectId === projectId)
        : mockSubmissions;
      return res.json({ success: true, submissions });
    }

    const query = projectId ? { projectId } : {};
    const submissions = await Submission.find(query).sort({ submittedAt: -1 });
    return res.json({ success: true, submissions });
  } catch (err) {
    next(err);
  }
};

export const reviewSubmission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!['accepted', 'rejected', 'changes_requested'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid review status' });
    }

    if (!isDbConnected()) {
      const sub = mockSubmissions.find((s) => s._id === id || s.id === id);
      if (sub) {
        sub.status = status;
        sub.feedback = feedback;
      }
      return res.json({ success: true, message: `Submission ${status}` });
    }

    const sub = await Submission.findById(id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });

    (sub as any).status = status;
    (sub as any).feedback = feedback;
    await sub.save();

    return res.json({ success: true, submission: sub, message: `Submission ${status}` });
  } catch (err) {
    next(err);
  }
};
