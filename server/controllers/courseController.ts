// server/controllers/courseController.ts
import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Certificate } from '../models/Certificate';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockCourses } from '../config/mockStore';

export const getCourses = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, courses: mockCourses });
    }
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const course = mockCourses.find((c) => c._id === id || c.id === id) || mockCourses[0];
      return res.json({ success: true, course });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const courseData = req.body;
    const instructorName = courseData.instructor || req.user?.email?.split('@')[0] || 'Sarah Jenkins';
    const instructorAvatar =
      courseData.instructorAvatar ||
      (req.user?.email
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.user.email)}`
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80');

    const newCourse: any = {
      title: courseData.title || 'Untitled Course',
      description: courseData.description || '',
      category: courseData.category || 'Web Development',
      level: courseData.level || 'Intermediate',
      language: courseData.language || 'English',
      duration: courseData.duration || '10 Hours',
      price: 'Free',
      thumbnail:
        courseData.thumbnail ||
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      status: courseData.published === false ? 'draft' : 'published',
      published: courseData.published !== undefined ? courseData.published : true,
      instructor: instructorName,
      instructorId: req.user?.id || undefined,
      instructorRole: req.user?.role || 'COURSE_EDUCATOR',
      instructorAvatar,
      learningObjectives: courseData.learningObjectives || courseData.whatYouWillLearn || [
        'Hands-on practical development',
        'Production architectural best practices',
      ],
      prerequisites: courseData.prerequisites || ['Basic programming knowledge'],
      tags: courseData.tags || ['Web Development', 'Full Stack'],
      curriculum: courseData.curriculum || [],
      rating: 5.0,
      reviewsCount: 0,
      studentsCount: 0,
      isFeatured: courseData.isFeatured || false,
    };

    if (!isDbConnected()) {
      const courseId = 'crs_' + Date.now();
      newCourse.id = courseId;
      newCourse._id = courseId;
      mockCourses.unshift(newCourse);
      return res.json({ success: true, course: newCourse });
    }

    const course = new Course(newCourse);
    await course.save();
    return res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isDbConnected()) {
      const idx = mockCourses.findIndex((c) => c._id === id || c.id === id);
      if (idx !== -1) {
        mockCourses[idx] = { ...mockCourses[idx], ...updateData, updatedAt: new Date() };
        return res.json({ success: true, course: mockCourses[idx] });
      }
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructorId && course.instructorId.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own courses.' });
    }

    Object.assign(course, updateData);
    if (updateData.published !== undefined) {
      course.status = updateData.published ? 'published' : 'draft';
    }
    await course.save();

    return res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const idx = mockCourses.findIndex((c) => c._id === id || c.id === id);
      if (idx !== -1) mockCourses.splice(idx, 1);
      return res.json({ success: true, message: 'Course deleted successfully' });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.instructorId && course.instructorId.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own courses.' });
    }
    await course.deleteOne();
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const publishCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const course = mockCourses.find((c) => c._id === id || c.id === id);
      if (course) {
        course.published = true;
        course.status = 'published';
      }
      return res.json({ success: true, message: 'Course published successfully', course });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.instructorId && course.instructorId.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You can only publish your own courses.' });
    }
    course.published = true;
    course.status = 'published';
    await course.save();
    return res.json({ success: true, message: 'Course published successfully', course });
  } catch (err) {
    next(err);
  }
};

export const enrollCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'usr_1';

    if (!isDbConnected()) {
      const enrollment = {
        id: 'enr_' + Date.now(),
        courseId: id,
        userId,
        progress: 0,
        completedLessons: [],
        completed: false,
        enrolledAt: new Date().toISOString(),
      };
      return res.json({ success: true, message: 'Successfully enrolled!', enrollment });
    }

    let enrollment = await Enrollment.findOne({ courseId: id, userId });
    if (!enrollment) {
      enrollment = new Enrollment({
        courseId: id,
        userId,
        progress: 0,
        completedLessons: [],
        completed: false,
      });
      await enrollment.save();

      // Increment course studentsCount
      await Course.findByIdAndUpdate(id, { $inc: { studentsCount: 1 } });
    }

    return res.json({ success: true, message: 'Successfully enrolled!', enrollment });
  } catch (err) {
    next(err);
  }
};

export const updateCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // courseId
    const { lessonId, progress, currentPosition, duration } = req.body;
    const userId = req.user?.id || 'usr_1';

    if (!isDbConnected()) {
      return res.json({
        success: true,
        message: 'Progress updated',
        progress: progress || 50,
        certificateIssued: false,
      });
    }

    let enrollment = await Enrollment.findOne({ courseId: id, userId });
    if (!enrollment) {
      enrollment = new Enrollment({ courseId: id, userId, progress: 0, completedLessons: [] });
    }

    if (lessonId && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    if (progress !== undefined) {
      enrollment.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    let certificateIssued = false;
    // Auto-issue certificate when course reaches 100%
    if (enrollment.progress >= 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();

      try {
        const course = await Course.findById(id);
        const existingCert = await Certificate.findOne({ courseId: id, studentId: userId });
        if (!existingCert && course) {
          const studentName = req.user?.email ? req.user.email.split('@')[0] : 'Student';
          const certificateId = `CI-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
          const cert = new Certificate({
            certificateId,
            studentId: userId,
            studentName,
            courseId: id,
            courseTitle: course.title,
            instructorName: typeof course.instructor === 'string' ? course.instructor : 'LearnX',
            issueDate: new Date(),
          });
          await cert.save();
          certificateIssued = true;
        }
      } catch (certErr) {
        console.error('Auto-certificate issuance error:', certErr);
      }
    }
    await enrollment.save();

    return res.json({ success: true, message: 'Progress updated', enrollment, certificateIssued });
  } catch (err) {
    next(err);
  }
};


/**
 * Evaluates student answers on backend, calculates score, and updates enrollment
 */
export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // courseId
    const { lessonId, answers } = req.body; // answers: { [questionIndex: number]: number (selectedOptionIndex) }
    const userId = req.user?.id || 'usr_1';

    let questions: any[] = [];

    if (!isDbConnected()) {
      const course = mockCourses.find((c) => c._id === id || c.id === id);
      if (course?.curriculum) {
        for (const mod of course.curriculum) {
          const lesson = mod.lessons?.find((l: any) => l.id === lessonId);
          if (lesson?.quiz?.questions) {
            questions = lesson.quiz.questions;
            break;
          }
        }
      }
    } else {
      const course = await Course.findById(id);
      if (course?.curriculum) {
        for (const mod of course.curriculum) {
          const lesson = mod.lessons?.find((l: any) => l.id === lessonId);
          if (lesson?.quiz?.questions) {
            questions = lesson.quiz.questions;
            break;
          }
        }
      }
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz questions not found for this lesson.' });
    }

    let correctCount = 0;
    const detailedResults = questions.map((q: any, idx: number) => {
      const userAnswer = answers?.[idx];
      const isCorrect = Number(userAnswer) === Number(q.correctAnswer);
      if (isCorrect) correctCount++;
      return {
        questionIndex: idx,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 70;

    // Mark lesson as complete if passed
    if (passed && isDbConnected()) {
      let enrollment = await Enrollment.findOne({ courseId: id, userId });
      if (enrollment && lessonId && !enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        await enrollment.save();
      }
    }

    return res.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: scorePercentage,
      passed,
      results: detailedResults,
    });
  } catch (err) {
    next(err);
  }
};

export const generateCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id || 'usr_1';
    const studentName = req.user?.email ? req.user.email.split('@')[0] : 'Alex Vance';

    const certificateId = `CI-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!isDbConnected()) {
      const cert = {
        _id: 'cert_' + Date.now(),
        certificateId,
        studentId: userId,
        studentName,
        courseId,
        courseTitle: 'Full Stack Masterclass',
        instructorName: 'Sarah Jenkins',
        issueDate: new Date(),
      };
      return res.json({ success: true, certificate: cert });
    }

    const course = await Course.findById(courseId);
    const courseTitle = course ? course.title : 'Full Stack Masterclass';
    const instructorName = course ? course.instructor : 'Sarah Jenkins';

    let cert = await Certificate.findOne({ courseId, studentId: userId });
    if (!cert) {
      cert = new Certificate({
        certificateId,
        studentId: userId,
        studentName,
        courseId,
        courseTitle,
        instructorName,
        issueDate: new Date(),
      });
      await cert.save();
    }

    return res.json({ success: true, certificate: cert });
  } catch (err) {
    next(err);
  }
};

export const getCertificateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Certificate verification requires database persistence.' });
    }
    const cert = await Certificate.findOne({ $or: [{ _id: id }, { certificateId: id }] });
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    return res.json({ success: true, certificate: cert });
  } catch (err) {
    next(err);
  }
};

export const getMyCertificates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'usr_1';

    if (!isDbConnected()) {
      // Return empty array when no DB — frontend falls back gracefully
      return res.json({ success: true, certificates: [] });
    }

    const certs = await Certificate.find({ studentId: userId }).sort({ issueDate: -1 });

    // Map to frontend Certificate shape
    const mapped = certs.map((c: any) => ({
      id: c._id?.toString() || c.certificateId,
      title: c.courseTitle || 'Course Certificate',
      issuer: 'LearnX Platform',
      recipientName: c.studentName || 'Student',
      issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
      credentialId: c.certificateId || c._id?.toString(),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://codeinfinite.dev/verify/${c.certificateId}`,
      skillsVerified: ['Full Stack Development', 'TypeScript', 'React', 'Node.js'],
      scorePercent: 100,
      signatureName: c.instructorName || 'LearnX Academy',
    }));

    return res.json({ success: true, certificates: mapped });
  } catch (err) {
    next(err);
  }
};
