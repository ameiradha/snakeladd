import { Quiz, Question } from '../types';

export interface AIStatusResponse {
  available: boolean;
  model: string;
  message: string;
}

export interface GenerateQuizParams {
  promptDescription?: string;
  subject: string;
  yearLevel: string;
  topic: string;
  language: 'en' | 'ms' | 'English' | 'Bahasa Melayu';
  count: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED';
  curriculumStandard?: string;
  includeExplanations?: boolean;
  includeAlternatives?: boolean;
}

export interface GenerateQuizResult {
  success: boolean;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  language: string;
  questions: Question[];
  meta: {
    count: number;
    generatedAt: string;
  };
}

export async function checkAIStatus(): Promise<AIStatusResponse> {
  try {
    const res = await fetch('/api/ai-status');
    if (!res.ok) {
      return {
        available: false,
        model: 'unknown',
        message: 'Could not connect to AI status endpoint.'
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      available: false,
      model: 'unknown',
      message: 'AI backend is unreachable (you may be offline).'
    };
  }
}

export async function requestAIGenerateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for bulk questions

  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errMsg = 'Failed to generate quiz with AI.';
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.error) {
          errMsg = errorJson.error;
        }
      } catch {
        // ignore fallback
      }
      throw new Error(errMsg);
    }

    const data: GenerateQuizResult = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI request timed out. Please check your network and try generating fewer questions or try again.');
    }
    throw error;
  }
}
