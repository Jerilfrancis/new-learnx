// server/controllers/codeController.ts
import { Request, Response, NextFunction } from 'express';

const LANGUAGE_VERSIONS: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  python3: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  rust: { language: 'rust', version: '1.68.2' },
  go: { language: 'go', version: '1.16.2' },
};

export const executeCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { language = 'javascript', code, stdin = '' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Source code is required for execution.' });
    }

    const langKey = language.toLowerCase();
    const langConfig = LANGUAGE_VERSIONS[langKey] || { language: 'javascript', version: '18.15.0' };

    const startTime = Date.now();

    // Call Piston API for sandboxed remote compilation and execution
    try {
      const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [{ content: code }],
          stdin: stdin || '',
        }),
      });

      if (pistonRes.ok) {
        const data: any = await pistonRes.json();
        const duration = Date.now() - startTime;

        const stdout = data.run?.stdout || data.compile?.stdout || '';
        const stderr = data.run?.stderr || data.compile?.stderr || '';
        const output = stdout || stderr || 'Program finished with no output.';

        return res.json({
          success: true,
          output,
          stdout,
          stderr,
          exitCode: data.run?.code ?? 0,
          executionTime: `${duration}ms`,
        });
      }
    } catch (pistonErr: any) {
      console.warn('Piston API call warning:', pistonErr.message);
    }

    return res.status(503).json({
      success: false,
      message: 'Code execution service is unavailable. Configure a sandboxed Piston-compatible runner.',
    });
  } catch (err) {
    next(err);
  }
};
