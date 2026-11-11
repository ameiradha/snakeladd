import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Check AI status without exposing secret keys
app.get('/api/ai-status', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    available: hasKey,
    model: 'gemini-3.8-flash',
    message: hasKey 
      ? 'AI Quiz Generator is ready to use.' 
      : 'GEMINI_API_KEY is not configured on the server. AI quiz generation is unavailable. All offline and manual quiz features remain fully operational.'
  });
});

// Secure AI quiz generator endpoint
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return res.status(503).json({
      error: 'AI service is not configured. Please ensure GEMINI_API_KEY is configured in your server environment.'
    });
  }

  const {
    promptDescription = '',
    title = '',
    subject = '',
    yearLevel = '',
    topic = '',
    language = 'en',
    count = 10,
    difficulty = 'Medium',
    questionType = 'MIXED',
    curriculumStandard = '',
    includeExplanations = true,
    includeAlternatives = true,
  } = req.body || {};

  const numQuestions = Math.min(Math.max(parseInt(count, 10) || 10, 1), 30);
  const langLower = String(language || '').toLowerCase();
  const isMalay = langLower === 'ms' || langLower.includes('melayu') || langLower.includes('malay') || langLower.includes('bahasa');
  const targetLanguage = isMalay ? 'Bahasa Melayu' : 'English';

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const userInstructions = promptDescription || title || topic || subject || 'General Knowledge';
    const systemInstruction = `You are an expert quiz designer and teacher.
Generate a structured quiz suitable for classroom board games (Snake & Ladder Quiz Arena).
Target Language: ${targetLanguage}.
Difficulty requested: ${difficulty}.
Questions requested: ${numQuestions}.
Question format requested: ${questionType}.
Teacher instructions & context: "${userInstructions}".

CRITICAL LANGUAGE & CONTENT MANDATE:
1. All question text, option text, and accepted answers MUST be written 100% strictly in ${targetLanguage}.
2. If Target Language is "Bahasa Melayu", DO NOT output English text for questions or options under any circumstances.
3. DO NOT generate any answer explanation under any circumstances. Always set the explanation field to an empty string "".
4. For MCQ: provide 4 distinct, unambiguous options with labels A, B, C, D. Specify the correct letter (e.g. "B") in correctAnswer.
5. For TRUE_FALSE: correctAnswer must be strictly either "TRUE" or "FALSE".
6. For SHORT_ANSWER: correctAnswer must be a concise answer (1-3 words in ${targetLanguage}). Provide common synonyms in ${targetLanguage} in acceptedAnswers ${includeAlternatives ? 'when applicable' : ''}.
7. Ensure all UTF-8 characters and Malay words are formatted cleanly.`;

    const userPrompt = `Please generate ${numQuestions} educational questions strictly in ${targetLanguage} based on: "${userInstructions}". Do not include any answer explanations.
Language: ${targetLanguage}.
Question Type: ${questionType}.
Difficulty: ${difficulty}.`;

    // Model cascade starting from lighter/faster model first as requested:
    // 1. gemini-3.1-flash-lite (lightest, highest availability)
    // 2. gemini-flash-latest (general flash alias)
    // 3. gemini-3.8-flash (standard flash model)
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    const generateConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        description: 'List of educational quiz questions',
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: 'The question text presented to students',
            },
            type: {
              type: Type.STRING,
              description: 'One of: MCQ, TRUE_FALSE, SHORT_ANSWER',
            },
            options: {
              type: Type.ARRAY,
              description: 'Array of 4 options for MCQ (empty for TRUE_FALSE or SHORT_ANSWER)',
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: 'Option key: A, B, C, or D' },
                  text: { type: Type.STRING, description: 'Option answer text' }
                },
                required: ['label', 'text']
              }
            },
            correctAnswer: {
              type: Type.STRING,
              description: 'For MCQ: A, B, C, or D. For TRUE_FALSE: TRUE or FALSE. For SHORT_ANSWER: canonical text answer'
            },
            acceptedAnswers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Alternative accepted answers for SHORT_ANSWER questions'
            },
            explanation: {
              type: Type.STRING,
              description: 'Clear pedagogical explanation'
            },
            difficulty: {
              type: Type.STRING,
              description: 'Easy, Medium, or Hard'
            }
          },
          required: ['question', 'type', 'correctAnswer', 'difficulty']
        }
      }
    };

    let response: any = null;
    let lastError: any = null;
    let usedModel = '';

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI Generation] Mencuba model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: generateConfig,
        });

        const rawText = response.text ? response.text.trim() : '';
        if (rawText && rawText.length > 0) {
          usedModel = modelName;
          console.log(`[AI Generation] Berjaya dijana menggunakan model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Generation] Model ${modelName} gagal atau sedang sibuk (503/429):`, err?.message || err);
        // Continue to the next fallback model in the list
      }
    }

    if (!response || !response.text || response.text.trim().length === 0) {
      throw lastError || new Error('Semua model Gemini sedang mengalami kesesakan sementara. Sila cuba sebentar lagi.');
    }

    const rawText = response.text.trim();
    const parsedQuestions = JSON.parse(rawText);
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('AI output did not contain an array of questions');
    }

    // Validate and sanitize questions
    const sanitizedQuestions = parsedQuestions.map((q: any, idx: number) => {
      let qType = (q.type || 'MCQ').toUpperCase();
      if (!['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'].includes(qType)) {
        qType = 'MCQ';
      }

      let options = q.options || [];
      if (qType === 'MCQ' && (!Array.isArray(options) || options.length < 2)) {
        options = [
          { label: 'A', text: 'Option A' },
          { label: 'B', text: 'Option B' },
          { label: 'C', text: 'Option C' },
          { label: 'D', text: 'Option D' }
        ];
      }

      let correctAnswer = String(q.correctAnswer || '').trim();
      if (qType === 'TRUE_FALSE') {
        correctAnswer = correctAnswer.toUpperCase().includes('TRUE') ? 'TRUE' : 'FALSE';
      } else if (qType === 'MCQ') {
        const firstChar = correctAnswer.charAt(0).toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(firstChar)) {
          correctAnswer = firstChar;
        } else {
          // Find matching option text if letter wasn't provided
          const matchedOpt = options.find((o: any) => o.text.trim().toLowerCase() === correctAnswer.toLowerCase());
          correctAnswer = matchedOpt ? matchedOpt.label : 'A';
        }
      }

      return {
        id: `gen_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        question: String(q.question || `Question ${idx + 1}`).trim(),
        type: qType,
        options: qType === 'MCQ' ? options.map((opt: any, oIdx: number) => ({
          label: opt.label || ['A', 'B', 'C', 'D'][oIdx] || 'A',
          text: String(opt.text || '').trim()
        })) : [],
        correctAnswer,
        acceptedAnswers: Array.isArray(q.acceptedAnswers) 
          ? q.acceptedAnswers.map((a: any) => String(a).trim()).filter(Boolean)
          : [],
        explanation: '',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : difficulty === 'Mixed' ? 'Medium' : difficulty,
      };
    });

    const generatedQuizTitle = title.trim() || promptDescription.trim().slice(0, 50) || topic.trim() || (subject ? `${subject} Quiz` : 'Snake & Ladder Quiz');

    return res.json({
      success: true,
      title: generatedQuizTitle,
      subject: subject || 'General',
      yearLevel: yearLevel || 'All Grades',
      topic: topic || generatedQuizTitle,
      language: targetLanguage,
      questions: sanitizedQuestions,
      meta: {
        count: sanitizedQuestions.length,
        model: usedModel,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate quiz with AI. Please try again or check your parameters.'
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Snake & Ladder Quiz Arena server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
