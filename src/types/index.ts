export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export interface QuestionOption {
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[]; // 4 options for MCQ
  correctAnswer: string; // 'A'|'B'|'C'|'D' or 'TRUE'|'FALSE' or string text
  acceptedAnswers?: string[]; // for SHORT_ANSWER synonyms
  explanation: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  language: 'en' | 'ms' | 'English' | 'Bahasa Melayu';
  description?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  icon: string; // emoji or identifier
  members?: string[];
  currentSquare: number; // 1 to 100
  correctCount: number;
  incorrectCount: number;
  attemptsCount: number;
  skippedTurns: number;
  isSkippedForTurn?: boolean;
}

export type WinningRule = 'EXACT' | 'REACH_OR_PASS';
export type WrongAnswerPenalty = 'NO_MOVE' | 'LOSE_TURN' | 'TEACHER_CHOICE';

export interface GameSettings {
  language: 'en' | 'ms';
  soundEnabled: boolean;
  classroomMode: boolean;
  winningRule: WinningRule;
  penaltyRule: WrongAnswerPenalty;
  questionTimerSeconds: number; // 0 for no timer
  reducedMotion: boolean;
}

export interface SnakeLadderElement {
  start: number;
  end: number;
  type: 'snake' | 'ladder';
}

export type GamePhase = 
  | 'SETUP' 
  | 'AWAIT_ROLL' 
  | 'ROLLING' 
  | 'QUESTION_ACTIVE' 
  | 'ANSWER_CONFIRMED' 
  | 'MOVING' 
  | 'SNAKE_LADDER_ANIM' 
  | 'VICTORY' 
  | 'PAUSED';

export interface GameSnapshot {
  teams: Team[];
  activeTeamIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  turnNumber: number;
  winningTeamId: string | null;
  lastActionDescription: string;
}

export interface GameRecord {
  id: string;
  date: string;
  quizTitle: string;
  quizSubject: string;
  teams: {
    name: string;
    color: string;
    icon: string;
    finalSquare: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
  }[];
  winner: string;
  winningRule: WinningRule;
  penaltyRule: WrongAnswerPenalty;
  durationSeconds: number;
  totalQuestionsAnswered: number;
}

export interface ExportData {
  schemaVersion: string;
  exportedAt: string;
  quizzes?: Quiz[];
  gameHistory?: GameRecord[];
  settings?: GameSettings;
}
