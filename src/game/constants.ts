import { SnakeLadderElement, Team } from '../types';

export const BOARD_SIZE = 100;
export const BOARD_ROWS = 10;
export const BOARD_COLS = 10;

// Carefully verified snakes and ladders:
// 1. Ladders: start < end. Neither start nor end is 1 or 100.
// 2. Snakes: start > end. Neither start nor end is 1 or 100.
// 3. No loops (a ladder top is never a snake head, and vice-versa).
export const LADDERS: SnakeLadderElement[] = [
  { start: 4, end: 14, type: 'ladder' },
  { start: 9, end: 31, type: 'ladder' },
  { start: 20, end: 38, type: 'ladder' },
  { start: 28, end: 84, type: 'ladder' },
  { start: 40, end: 59, type: 'ladder' },
  { start: 51, end: 67, type: 'ladder' },
  { start: 63, end: 81, type: 'ladder' },
  { start: 71, end: 91, type: 'ladder' },
];

export const SNAKES: SnakeLadderElement[] = [
  { start: 17, end: 7, type: 'snake' },
  { start: 54, end: 34, type: 'snake' },
  { start: 62, end: 19, type: 'snake' },
  { start: 64, end: 60, type: 'snake' },
  { start: 87, end: 24, type: 'snake' },
  { start: 93, end: 73, type: 'snake' },
  { start: 95, end: 75, type: 'snake' },
  { start: 99, end: 78, type: 'snake' },
];

export const ALL_SNAKES_AND_LADDERS: SnakeLadderElement[] = [
  ...LADDERS,
  ...SNAKES,
];

export const PRESET_ALL_TEAMS: Team[] = [
  {
    id: 'team_red',
    name: 'Team Red Lions',
    color: '#ef4444',
    icon: '🦁',
    members: ['Adam', 'Rayyan', 'Farhan'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_blue',
    name: 'Team Blue Eagles',
    color: '#3b82f6',
    icon: '🦅',
    members: ['Aina', 'Sara', 'Maya'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_green',
    name: 'Team Green Dragons',
    color: '#10b981',
    icon: '🐉',
    members: ['Danial', 'Irfan', 'Zack'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_yellow',
    name: 'Team Golden Tigers',
    color: '#f59e0b',
    icon: '🐯',
    members: ['Aisyah', 'Iman', 'Nurin'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_purple',
    name: 'Team Purple Phoenix',
    color: '#a855f7',
    icon: '🔥',
    members: ['Hafiz', 'Luqman', 'Amir'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_cyan',
    name: 'Team Cyan Sharks',
    color: '#06b6d4',
    icon: '🦈',
    members: ['Chloe', 'Ethan', 'Lucas'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_orange',
    name: 'Team Orange Foxes',
    color: '#f97316',
    icon: '🦊',
    members: ['Siti', 'Zara', 'Damia'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_pink',
    name: 'Team Pink Flamingos',
    color: '#ec4899',
    icon: '🦩',
    members: ['Hannah', 'Alia', 'Mia'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_emerald',
    name: 'Team Emerald Falcons',
    color: '#059669',
    icon: '⚡',
    members: ['Arif', 'Danish', 'Khairul'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_indigo',
    name: 'Team Indigo Wolves',
    color: '#6366f1',
    icon: '🐺',
    members: ['Ken', 'Ryan', 'Alex'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_teal',
    name: 'Team Teal Dolphins',
    color: '#14b8a6',
    icon: '🐬',
    members: ['Nadia', 'Sarah', 'Bella'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
  {
    id: 'team_amber',
    name: 'Team Amber Bears',
    color: '#d97706',
    icon: '🐻',
    members: ['Harith', 'Naufal', 'Hakim'],
    currentSquare: 1,
    correctCount: 0,
    incorrectCount: 0,
    attemptsCount: 0,
    skippedTurns: 0,
  },
];

// Default to 2 teams as requested
export const DEFAULT_TEAMS: Team[] = PRESET_ALL_TEAMS.slice(0, 2);

export const AVAILABLE_TEAM_ICONS = [
  '🦁', '🦅', '🐉', '🐯', '🔥', '🦈', '🦊', '🦩', '⚡', '🐺', '🐬', '🐻',
  '🐼', '🦉', '🐆', '🦄', '🚀', '⭐', '👑', '🏆', '🎯', '💎', '🛡️', '🍀'
];

export const AVAILABLE_TEAM_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#059669',
  '#b45309', '#0284c7', '#4338ca', '#be185d', '#047857', '#d97706'
];

/**
 * Calculates board coordinate for square number (1 to 100)
 * Square 1 is bottom-left, row 9 (0 is top row)
 * Alternates left-to-right, then right-to-left
 */
export function getSquareCoordinates(squareNum: number): { row: number; col: number; xPercent: number; yPercent: number } {
  const clamped = Math.max(1, Math.min(100, squareNum));
  const bottomRowIndex = Math.floor((clamped - 1) / 10); // 0 to 9
  const row = 9 - bottomRowIndex; // 0 is top row, 9 is bottom row
  const isEvenFromBottom = bottomRowIndex % 2 === 0;
  const col = isEvenFromBottom 
    ? (clamped - 1) % 10 
    : 9 - ((clamped - 1) % 10);

  // Center percentage inside 10x10 grid (each cell is 10%)
  const xPercent = col * 10 + 5;
  const yPercent = row * 10 + 5;

  return { row, col, xPercent, yPercent };
}
