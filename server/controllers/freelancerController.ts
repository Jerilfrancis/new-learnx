import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service';
import { Workshop } from '../models/Workshop';
import { MentoringSlot } from '../models/MentoringSlot';
import { MentoringRequest } from '../models/MentoringRequest';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockUsers } from '../config/mockStore';

// In-memory fallbacks when DB is offline
const mockServices: any[] = [];
const mockWorkshops: any[] = [];
const mockSlots: any[] = [];
const mockRequests: any[] = [];

// SERVICES
export const getServices = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, services: mockServices });
    }
    const services = await Service.find().populate('freelancerId', 'name avatar handle role').sort({ createdAt: -1 });
    return res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, skills, price, deliveryTime, portfolio } = req.body;
    const freelancerId = req.user?.id || 'usr_1';

    if (!title || !description || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, description, and price are required.' });
    }

    if (!isDbConnected()) {
      const service = {
        _id: 'srv_' + Date.now(),
        freelancerId,
        title,
        description,
        category: category || 'Development',
        skills: skills || [],
        price: Number(price),
        deliveryTime: deliveryTime || '3 days',
        portfolio: portfolio || [],
        availability: true,
        rating: 5.0,
        ordersCount: 0,
        createdAt: new Date(),
      };
      mockServices.unshift(service);
      return res.status(201).json({ success: true, service, message: 'Service created successfully' });
    }

    const service = new Service({
      freelancerId,
      title,
      description,
      category: category || 'Development',
      skills: skills || [],
      price: Number(price),
      deliveryTime: deliveryTime || '3 days',
      portfolio: portfolio || [],
    });
    await service.save();

    return res.status(201).json({ success: true, service, message: 'Service created successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const idx = mockServices.findIndex((s) => s._id === id);
      if (idx !== -1) mockServices.splice(idx, 1);
      return res.json({ success: true, message: 'Service deleted' });
    }
    await Service.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};

// WORKSHOPS
export const getWorkshops = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, workshops: mockWorkshops });
    }
    const workshops = await Workshop.find().populate('freelancerId', 'name avatar handle').sort({ date: 1 });
    return res.json({ success: true, workshops });
  } catch (err) {
    next(err);
  }
};

export const createWorkshop = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, thumbnail, date, time, duration, price, participantLimit } = req.body;
    const freelancerId = req.user?.id || 'usr_1';

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'Title, description, and date are required.' });
    }

    if (!isDbConnected()) {
      const workshop = {
        _id: 'ws_' + Date.now(),
        freelancerId,
        title,
        description,
        thumbnail,
        date: new Date(date),
        time: time || '18:00 IST',
        duration: duration || '2 hours',
        price: Number(price) || 0,
        participantLimit: Number(participantLimit) || 50,
        enrolledCount: 0,
        createdAt: new Date(),
      };
      mockWorkshops.unshift(workshop);
      return res.status(201).json({ success: true, workshop, message: 'Workshop created successfully' });
    }

    const workshop = new Workshop({
      freelancerId,
      title,
      description,
      thumbnail,
      date: new Date(date),
      time: time || '18:00 IST',
      duration: duration || '2 hours',
      price: Number(price) || 0,
      participantLimit: Number(participantLimit) || 50,
    });
    await workshop.save();

    return res.status(201).json({ success: true, workshop, message: 'Workshop created successfully' });
  } catch (err) {
    next(err);
  }
};

// MENTORING SLOTS
export const getMentoringSlots = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, slots: mockSlots });
    }
    const slots = await MentoringSlot.find().populate('mentorId', 'name avatar handle bio skills').sort({ dateTime: 1 });
    return res.json({ success: true, slots });
  } catch (err) {
    next(err);
  }
};

export const createMentoringSlot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { topic, dateTime, durationMinutes, price } = req.body;
    const mentorId = req.user?.id || 'usr_1';

    if (!topic || !dateTime) {
      return res.status(400).json({ success: false, message: 'Topic and dateTime are required.' });
    }

    if (!isDbConnected()) {
      const slot = {
        _id: 'slot_' + Date.now(),
        mentorId,
        topic,
        dateTime: new Date(dateTime),
        durationMinutes: Number(durationMinutes) || 45,
        price: Number(price) || 0,
        isBooked: false,
        createdAt: new Date(),
      };
      mockSlots.unshift(slot);
      return res.status(201).json({ success: true, slot, message: 'Mentoring slot created' });
    }

    const slot = new MentoringSlot({
      mentorId,
      topic,
      dateTime: new Date(dateTime),
      durationMinutes: Number(durationMinutes) || 45,
      price: Number(price) || 0,
    });
    await slot.save();

    return res.status(201).json({ success: true, slot, message: 'Mentoring slot created' });
  } catch (err) {
    next(err);
  }
};

export const requestMentoring = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { slotId, mentorId, message } = req.body;
    const studentId = req.user?.id || 'usr_1';

    if (!slotId || !mentorId) {
      return res.status(400).json({ success: false, message: 'slotId and mentorId are required.' });
    }

    if (!isDbConnected()) {
      const mentoringRequest = {
        _id: 'mreq_' + Date.now(),
        slotId,
        studentId,
        mentorId,
        message: message || '',
        status: 'pending',
        createdAt: new Date(),
      };
      mockRequests.unshift(mentoringRequest);
      return res.status(201).json({ success: true, mentoringRequest, message: 'Mentoring request submitted' });
    }

    const slot = await MentoringSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Slot is already booked' });

    slot.isBooked = true;
    await slot.save();

    const mentoringRequest = new MentoringRequest({
      slotId,
      studentId,
      mentorId,
      message: message || '',
      status: 'pending',
    });
    await mentoringRequest.save();

    return res.status(201).json({ success: true, mentoringRequest, message: 'Mentoring request submitted' });
  } catch (err) {
    next(err);
  }
};

export const updateMentoringRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'rejected' | 'completed' | 'cancelled'

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (!isDbConnected()) {
      const reqItem = mockRequests.find((r) => r._id === id);
      if (reqItem) reqItem.status = status;
      return res.json({ success: true, message: `Request ${status}` });
    }

    const mentoringRequest = await MentoringRequest.findById(id);
    if (!mentoringRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    mentoringRequest.status = status;
    await mentoringRequest.save();

    return res.json({ success: true, mentoringRequest, message: `Request ${status}` });
  } catch (err) {
    next(err);
  }
};

// GET MENTORS — Aggregates users with FREELANCER/EDUCATOR role who have mentoring slots
export const getMentors = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      // Return curated fallback mentors when DB is not connected
      const fallback = [
        {
          id: 'mentor_1',
          name: 'Sarah Jenkins',
          role: 'VP of Engineering',
          company: 'Meta',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          rating: 4.9,
          reviewsCount: 183,
          topics: ['System Design', 'React 19', 'TypeScript', 'Node.js'],
          hourlyRate: '$120/hr',
          bio: 'Ex-Meta, 12 years building high-scale distributed systems. Helping engineers level up to senior.',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          isTopMentor: true,
        },
        {
          id: 'mentor_2',
          name: 'David Kim',
          role: 'Principal Cloud Architect',
          company: 'AWS',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          rating: 4.8,
          reviewsCount: 94,
          topics: ['AWS', 'Kubernetes', 'DevOps', 'Terraform'],
          hourlyRate: '$150/hr',
          bio: 'Principal Architect at AWS. Teaching cloud-native architecture and DevOps excellence.',
          availableDays: ['Tuesday', 'Thursday'],
          isTopMentor: true,
        },
        {
          id: 'mentor_3',
          name: 'Priya Sharma',
          role: 'AI Research Engineer',
          company: 'Google DeepMind',
          avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80',
          rating: 5.0,
          reviewsCount: 61,
          topics: ['LLM Engineering', 'Python', 'TensorFlow', 'MLOps'],
          hourlyRate: '$180/hr',
          bio: 'AI Research at Google DeepMind. Specialising in LLM fine-tuning and production ML pipelines.',
          availableDays: ['Monday', 'Saturday'],
          isTopMentor: false,
        },
      ];
      return res.json({ success: true, mentors: fallback });
    }

    // With DB: pull slots and populate mentor user data
    const slots = await MentoringSlot.find({ isBooked: false })
      .populate('mentorId', 'name avatar handle bio skills role')
      .sort({ dateTime: 1 })
      .lean();

    // Deduplicate by mentorId to get unique mentors
    const seenIds = new Set<string>();
    const mentors = slots
      .filter((s: any) => s.mentorId && s.mentorId._id)
      .filter((s: any) => {
        const mid = s.mentorId._id.toString();
        if (seenIds.has(mid)) return false;
        seenIds.add(mid);
        return true;
      })
      .map((s: any) => ({
        id: s.mentorId._id.toString(),
        name: s.mentorId.name || 'Mentor',
        role: s.mentorId.role || 'Senior Engineer',
        company: 'LearnX',
        avatar: s.mentorId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.mentorId.name}`,
        rating: 5.0,
        reviewsCount: 0,
        topics: s.mentorId.skills || ['JavaScript', 'React', 'Node.js'],
        hourlyRate: `$${s.price || 50}/hr`,
        bio: s.mentorId.bio || 'Experienced software engineer offering 1:1 mentoring sessions.',
        availableDays: ['Flexible'],
        isTopMentor: false,
      }));

    return res.json({ success: true, mentors });
  } catch (err) {
    next(err);
  }
};
