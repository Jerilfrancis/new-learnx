// server/controllers/postController.ts
import { Response, NextFunction } from 'express';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockPosts } from '../config/mockStore';

export const getPosts = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, posts: mockPosts });
    }
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newPostData = req.body;
    const authorInfo = newPostData.author || {
      name: 'Alex Vance',
      handle: 'alexvance',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    if (isDbConnected() && req.user?.id) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) {
        authorInfo.id = dbUser._id;
        authorInfo.name = dbUser.name;
        authorInfo.handle = dbUser.handle;
        authorInfo.role = dbUser.role;
        authorInfo.avatar = dbUser.avatar;
      }
    }

    const newPost: any = {
      author: authorInfo,
      timestamp: 'Just now',
      content: newPostData.content || '',
      media: newPostData.media || [],
      codeSnippet: newPostData.codeSnippet || null,
      codeLang: newPostData.codeLang || null,
      pollData: newPostData.pollData || null,
      projectHighlight: newPostData.projectHighlight || null,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      hasLiked: false,
      isSaved: false,
      commentsList: [],
    };

    if (!isDbConnected()) {
      const postId = 'post_' + Date.now();
      newPost._id = postId;
      newPost.id = postId;
      mockPosts.unshift(newPost);
      return res.json({ success: true, post: newPost });
    }

    const post = new Post(newPost);
    await post.save();
    return res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const post = mockPosts.find((p) => p.id === id || p._id === id);
      if (post) {
        post.hasLiked = !post.hasLiked;
        post.likes += post.hasLiked ? 1 : -1;
        return res.json({ success: true, likes: post.likes, hasLiked: post.hasLiked });
      }
      return res.json({ success: true, likes: 1, hasLiked: true });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const alreadyLiked = post.likedBy.some((likedBy) => likedBy.toString() === userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((likedBy) => likedBy.toString() !== userId) as any;
      post.likes = Math.max(0, (post.likes || 0) - 1);
    } else {
      post.likedBy.push(userId as any);
      post.likes = (post.likes || 0) + 1;
    }
    await post.save();
    return res.json({ success: true, likes: post.likes, hasLiked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

export const commentPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const newComment: any = {
      id: 'cmt_' + Date.now(),
      author: 'Alex Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text,
      timestamp: 'Just now',
      likes: 0,
    };

    if (!isDbConnected()) {
      const post = mockPosts.find((p) => p.id === id || p._id === id);
      if (post) {
        post.commentsList = post.commentsList || [];
        post.commentsList.push(newComment);
        post.commentsCount = post.commentsList.length;
        return res.json({ success: true, commentsList: post.commentsList });
      }
      return res.json({ success: true, commentsList: [newComment] });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    newComment.authorId = req.user?.id as any;
    post.commentsList.push(newComment);
    post.commentsCount = post.commentsList.length;
    await post.save();
    return res.json({ success: true, commentsList: post.commentsList });
  } catch (err) {
    next(err);
  }
};

export const bookmarkPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Bookmarks require database persistence.' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const alreadySaved = post.savedBy.some((savedBy) => savedBy.toString() === userId);
    post.savedBy = alreadySaved
      ? post.savedBy.filter((savedBy) => savedBy.toString() !== userId) as any
      : [...post.savedBy, userId as any];
    await post.save();
    return res.json({ success: true, isSaved: !alreadySaved });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const idx = mockPosts.findIndex((p) => p.id === id || p._id === id);
      if (idx !== -1) mockPosts.splice(idx, 1);
      return res.json({ success: true });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.id?.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
    }
    await post.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
