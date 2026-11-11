import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // Allow POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on Vercel environment variables. Please add GEMINI_API_KEY in your Vercel Project Settings.',
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
          'User-Agent': 'aistudio-build-vercel',
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

CRITICAL LANGUAGE MANDATE:
1. All question text, option text, explanations, and accepted answers MUST be written 100% strictly in ${targetLanguage}.
2. If Target Language is "Bahasa Melayu", DO NOT output English text for questions, options, or explanations under any circumstances.
3. For MCQ: provide 4 distinct, unambiguous options with labels A, B, C, D. Specify the correct letter (e.g. "B") in correctAnswer.
4. For TRUE_FALSE: correctAnswer must be strictly either "TRUE" or "FALSE".
5. For SHORT_ANSWER: correctAnswer must be a concise answer (1-3 words in ${targetLanguage}). Provide common synonyms in ${targetLanguage} in acceptedAnswers ${includeAlternatives ? 'when applicable' : ''}.
6. ${includeExplanations ? `Provide a clear, educational explanation in ${targetLanguage} for why the answer is correct.` : `Provide a short explanation in ${targetLanguage}.`}
7. Ensure all UTF-8 characters and Malay words are formatted cleanly.`;

    const userPrompt = `Please generate ${numQuestions} educational questions strictly in ${targetLanguage} based on: "${userInstructions}".
Language: ${targetLanguage}.
Question Type: ${questionType}.
Difficulty: ${difficulty}.`;

    // Model cascade starting from lighter/faster model first:
    // 1. gemini-3.1-flash-lite (lightweight, lowest latency & high availability)
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
                  text: { type: Type.STRING, description: 'Option answer text' },
                },
                required: ['label', 'text'],
              },
            },
            correctAnswer: {
              type: Type.STRING,
              description: 'For MCQ: A, B, C, or D. For TRUE_FALSE: TRUE or FALSE. For SHORT_ANSWER: canonical text answer',
            },
            acceptedAnswers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Alternative accepted answers for SHORT_ANSWER questions',
            },
            explanation: {
              type: Type.STRING,
              description: 'Clear pedagogical explanation',
            },
            difficulty: {
              type: Type.STRING,
              description: 'Easy, Medium, or Hard',
            },
          },
          required: ['question', 'type', 'correctAnswer', 'difficulty'],
        },
      },
    };

    let response: any = null;
    let lastError: any = null;
    let usedModel = '';

    for (const modelName of candidateModels) {
      try {
        console.log(`[Vercel AI Generation] Mencuba model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: generateConfig,
        });

        const rawText = response.text ? response.text.trim() : '';
        if (rawText && rawText.length > 0) {
          usedModel = modelName;
          console.log(`[Vercel AI Generation] Berjaya dijana menggunakan model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Vercel AI Generation] Model ${modelName} gagal atau sedang sibuk (503/429):`, err?.message || err);
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
          { label: 'D', text: 'Option D' },
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
          const matchedOpt = options.find(
            (o: any) => o.text.trim().toLowerCase() === correctAnswer.toLowerCase()
          );
          correctAnswer = matchedOpt ? matchedOpt.label : 'A';
        }
      }

      return {
        id: `gen_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        question: String(q.question || `Question ${idx + 1}`).trim(),
        type: qType,
        options:
          qType === 'MCQ'
            ? options.map((opt: any, oIdx: number) => ({
                label: opt.label || ['A', 'B', 'C', 'D'][oIdx] || 'A',
                text: String(opt.text || '').trim(),
              }))
            : [],
        correctAnswer,
        acceptedAnswers: Array.isArray(q.acceptedAnswers)
          ? q.acceptedAnswers.map((a: any) => String(a).trim()).filter(Boolean)
          : [],
        explanation: String(q.explanation || 'No explanation provided.').trim(),
        difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
          ? q.difficulty
          : difficulty === 'Mixed'
          ? 'Medium'
          : difficulty,
      };
    });

    const generatedQuizTitle =
      title.trim() ||
      promptDescription.trim().slice(0, 50) ||
      topic.trim() ||
      (subject ? `${subject} Quiz` : 'Snake & Ladder Quiz');

    return res.status(200).json({
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
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate quiz with AI. Please check parameters.',
    });
  }
}
