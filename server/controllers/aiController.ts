// server/controllers/aiController.ts
import { Request, Response, NextFunction } from 'express';
import { GROQ_API_KEY, GROQ_MODEL } from '../config/env';

/**
 * GROQ AI: Generate Multiple Choice Questions from lesson content
 */
export const generateMcqs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, numberOfQuestions = 5, difficulty = 'medium' } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid educational content (at least 10 characters) to generate questions.',
      });
    }

    const count = Math.min(20, Math.max(1, Number(numberOfQuestions) || 5));
    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    if (!GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Groq AI is not configured. Please add GROQ_API_KEY to the server environment.',
      });
    }

    const systemPrompt = `You are an expert educational assessment generator on the LearnX platform.
Generate multiple-choice questions from the supplied educational content.

Strict Rules:
1. Generate exactly ${count} multiple-choice questions.
2. Each question MUST have exactly 4 distinct options.
3. Only one option can be correct.
4. "correctAnswer" MUST be an integer index (0, 1, 2, or 3) indicating the correct option.
5. Questions must be answerable using the supplied content only.
6. Match the requested difficulty level: "${validDifficulty}".
7. Include a clear, educational explanation for why the correct answer is right.
8. Return strictly a valid JSON object matching this exact schema:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 1,
      "explanation": "Explanation why Option 1 is correct"
    }
  ]
}`;

    const userPrompt = `Content to generate ${count} (${validDifficulty}) MCQs from:\n\n"""\n${content.trim()}\n"""`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', groqResponse.status, errorText);
      return res.status(502).json({
        success: false,
        message: `Groq AI generation error (${groqResponse.status}). Please check your GROQ_API_KEY.`,
      });
    }

    const data: any = await groqResponse.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return res.status(502).json({ success: false, message: 'Groq returned an empty response.' });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({ success: false, message: 'Failed to parse JSON response from Groq AI.' });
    }

    const rawQuestions = parsed.questions || parsed.mcqs || (Array.isArray(parsed) ? parsed : []);

    // Sanitize and validate questions structure
    const validatedQuestions = rawQuestions.map((q: any, idx: number) => {
      const options = Array.isArray(q.options) && q.options.length >= 4
        ? q.options.slice(0, 4).map(String)
        : [
            q.options?.[0] || 'Option A',
            q.options?.[1] || 'Option B',
            q.options?.[2] || 'Option C',
            q.options?.[3] || 'Option D',
          ];

      let correctIndex = Number(q.correctAnswer ?? q.correctIndex ?? 0);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        correctIndex = 0;
      }

      return {
        id: `q_${Date.now()}_${idx}`,
        question: String(q.question || `Question ${idx + 1}`),
        options,
        correctAnswer: correctIndex,
        explanation: String(q.explanation || 'Refer to the lesson content.'),
      };
    });

    return res.json({
      success: true,
      model: GROQ_MODEL || 'llama-3.3-70b-versatile',
      count: validatedQuestions.length,
      questions: validatedQuestions,
    });
  } catch (err: any) {
    console.error('AI Generate MCQs Exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate MCQs.' });
  }
};

export const solveDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, codeContext, language } = req.body;
    if (!query && !codeContext) {
      return res.status(400).json({ error: 'Please provide a query or code context.' });
    }

    // Try Groq first if available
    if (GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are "LearnX AI", an expert developer mentor on the LearnX platform. Provide a structured, encouraging answer with concise direct solution, explanation, and code snippets.',
            },
            {
              role: 'user',
              content: `Language: ${language || 'General'}\n${codeContext ? `Code Context:\n${codeContext}\n` : ''}\nQuestion: ${query}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        return res.json({ result: data.choices?.[0]?.message?.content || '' });
      }
    }

    return res.status(503).json({ success: false, message: 'Groq AI is not configured or unavailable.' });
  } catch (err: any) {
    console.error('AI Solve Doubt Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate solution.' });
  }
};

export const generateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, timeframe, experienceLevel } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a learning topic.' });
    }

    if (GROQ_API_KEY) {
      const prompt = `Generate a modern, highly practical learning roadmap for "${topic}".
Timeframe: ${timeframe || '4 weeks'}
Experience Level: ${experienceLevel || 'Beginner to Intermediate'}

Provide structured response as JSON matching this format:
{
  "title": "Roadmap Title",
  "overview": "Brief high level summary",
  "phases": [
    {
      "phaseName": "Phase 1: Foundations",
      "duration": "1 Week",
      "topics": ["Topic 1", "Topic 2"],
      "projectChallenge": "Small project idea to build",
      "keyResources": ["Resource 1", "Resource 2"]
    }
  ],
  "capstoneProject": "Final Portfolio Project Name & Description",
  "careerOutcomes": ["Role 1", "Role 2"]
}`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a career roadmap planner. Respond strictly with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (groqRes.ok) {
        const data: any = await groqRes.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return res.json({ roadmap: parsed });
      }
    }

    return res.status(503).json({ success: false, message: 'Groq AI is not configured or unavailable.' });
  } catch (err: any) {
    console.error('AI Roadmap Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate roadmap.' });
  }
};

export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.content && req.body.topic) {
    req.body.content = req.body.topic;
  }
  return generateMcqs(req, res, next);
};

export const reviewProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bio, skills, projectsCount } = req.body;
    if (GROQ_API_KEY) {
      const prompt = `Act as a Senior Tech Recruiter. Evaluate this developer profile:
Bio: ${bio}
Skills: ${skills ? skills.join(', ') : 'JavaScript, React, Node.js'}
Projects Completed: ${projectsCount || 3}

Provide concise feedback with:
1. Overall Impact Score (1-100)
2. Key Strengths
3. Top Improvements
4. Recommended Next Project`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (groqRes.ok) {
        const data: any = await groqRes.json();
        return res.json({ review: data.choices?.[0]?.message?.content || '' });
      }
    }

    return res.status(503).json({ success: false, message: 'Groq AI is not configured or unavailable.' });
  } catch (err: any) {
    console.error('AI Profile Review Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to review profile.' });
  }
};

/**
 * GROQ AI: Conduct Mock Technical Interview Turn & Scorecard
 */
export const conductInterviewTurn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role = 'Full-Stack Software Engineer', topic = 'System Design & Algorithms', history = [], candidateAnswer = '' } = req.body;

    if (!GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'Groq AI is not configured.' });
    }

    const messages = [
      {
        role: 'system',
        content: `You are a Principal Engineering Interviewer at top tech companies conducting a realistic technical interview for a "${role}" position on the topic of "${topic}".
Instructions:
1. Review the interview dialogue history and the candidate's latest response.
2. If this is question 1-3, give a brief 1-sentence reaction to the candidate's answer, and then ask the NEXT challenging follow-up question or coding question.
3. If this is question 4 or the candidate says "finish interview", provide a final closing response AND include a JSON scorecard block wrapped in \`\`\`json { ... } \`\`\` with:
{
  "problemSolving": 85,
  "systemDesign": 80,
  "communication": 90,
  "codeQuality": 88,
  "overallScore": 86,
  "verdict": "Hire",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}
Keep tone professional, encouraging, yet rigorous.`,
      },
      ...history.map((h: any) => ({
        role: h.sender === 'interviewer' ? 'assistant' : 'user',
        content: h.text,
      })),
      ...(candidateAnswer ? [{ role: 'user', content: candidateAnswer }] : []),
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(502).json({ success: false, message: `Groq error: ${errText}` });
    }

    const data: any = await groqRes.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Extract JSON scorecard if present
    let scoreCard = undefined;
    let interviewerResponse = rawContent;

    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        scoreCard = JSON.parse(jsonMatch[1]);
        interviewerResponse = rawContent.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
      } catch (parseErr) {
        // Fallback scoreCard
      }
    }

    return res.json({
      success: true,
      interviewerResponse: interviewerResponse || rawContent,
      scoreCard,
      isComplete: !!scoreCard,
    });
  } catch (err: any) {
    next(err);
  }
};

