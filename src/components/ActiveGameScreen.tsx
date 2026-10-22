import React, { useState, useEffect } from 'react';
import { Quiz, Team, GameSettings, GameRecord } from '../types';
import { GameEngine, GameEngineState } from '../game/engine';
import { GameBoard } from './GameBoard';
import { DiceRoller } from './DiceRoller';
import { QuestionModal } from './QuestionModal';
import { Scoreboard } from './Scoreboard';
import { VictoryModal } from './VictoryModal';
import {
  RotateCcw,
  Undo2,
  Pause,
  Play,
  StopCircle,
} from 'lucide-react';

interface ActiveGameScreenProps {
  quiz: Quiz;
  initialTeams: Team[];
  settings: GameSettings;
  onEndGame: (record?: GameRecord) => void;
  onPlayAgain: () => void;
  onNewGameSetup: () => void;
  onReturnDashboard: () => void;
}

export const ActiveGameScreen: React.FC<ActiveGameScreenProps> = ({
  quiz,
  initialTeams,
  settings,
  onEndGame,
  onPlayAgain,
  onNewGameSetup,
  onReturnDashboard,
}) => {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const [gameStartTime] = useState<number>(Date.now());
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const newEngine = new GameEngine(
      initialTeams,
      quiz.questions,
      settings,
      (updatedState) => {
        setGameState(updatedState);
      }
    );
    setEngine(newEngine);
    setGameState(newEngine.getState());
  }, [quiz, initialTeams, settings]);

  if (!engine || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-800 font-bold">
        Sedang memuatkan Snake Ladd...
      </div>
    );
  }

  const activeTeam = gameState.teams[gameState.activeTeamIndex];
  const isRolling = gameState.phase === 'ROLLING';
  const isMoving = gameState.phase === 'MOVING';
  const isSnakeLadderAnim = gameState.phase === 'SNAKE_LADDER_ANIM';
  const isControlsDisabled = isRolling || isMoving || isSnakeLadderAnim || isPaused;

  const handleRollDice = () => {
    if (isControlsDisabled) return;
    engine.startDiceRoll();
  };

  const handleSelectAnswer = (ans: string) => {
    engine.selectAnswer(ans);
  };

  const handleConfirmAnswer = (overrideCorrect?: boolean, customPenalty?: any) => {
    engine.confirmAnswer(overrideCorrect, customPenalty);
  };

  const handleApplyMovement = () => {
    engine.applyMovementAndAdvance();
  };

  const handleUndo = () => {
    engine.undo();
  };

  const handleRestart = () => {
    if (confirm('Adakah anda pasti mahu memulakan semula perlawanan ini dari petak 1?')) {
      const resetEngine = new GameEngine(
        initialTeams,
        quiz.questions,
        settings,
        (updatedState) => setGameState(updatedState)
      );
      setEngine(resetEngine);
      setGameState(resetEngine.getState());
    }
  };

  const handleEndGameConfirm = () => {
    if (confirm('Adakah anda pasti mahu menamatkan permainan ini? Keputusan terkini akan disimpan ke dalam rekod.')) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
      const sortedTeams = [...gameState.teams].sort((a, b) => b.currentSquare - a.currentSquare);

      const record: GameRecord = {
        id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toISOString(),
        quizTitle: quiz.title,
        quizSubject: quiz.subject,
        teams: sortedTeams.map((t) => ({
          name: t.name,
          color: t.color,
          icon: t.icon,
          finalSquare: t.currentSquare,
          correctCount: t.correctCount,
          incorrectCount: t.incorrectCount,
          accuracy: t.attemptsCount > 0 ? Math.round((t.correctCount / t.attemptsCount) * 100) : 0,
        })),
        winner: sortedTeams[0]?.name || 'Unknown',
        winningRule: settings.winningRule,
        penaltyRule: settings.penaltyRule,
        durationSeconds,
        totalQuestionsAnswered: gameState.teams.reduce((acc, t) => acc + t.attemptsCount, 0),
      };

      onEndGame(record);
    }
  };

  const winningTeam = gameState.winningTeamId
    ? gameState.teams.find((t) => t.id === gameState.winningTeamId)
    : null;

  return (
    <div className="w-full h-[calc(100vh-64px)] max-h-[100vh] overflow-hidden flex flex-col p-2 sm:p-3 bg-slate-100 space-y-2">
      {/* Top Game Controls Toolbar - Bright Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white border-2 border-slate-200 rounded-2xl shadow-sm shrink-0">
        {/* Left: Active Team Turn */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md shrink-0 ring-2 ring-slate-800"
            style={{ backgroundColor: activeTeam.color }}
          >
            {activeTeam.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Pusingan #{gameState.turnNumber}
              </span>
              {activeTeam.isSkippedForTurn && (
                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                  DILANGKAU
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {activeTeam.name}
            </h3>
          </div>
        </div>

        {/* Center: Live Action Feedback */}
        <div className="hidden md:block flex-1 max-w-xl mx-2 text-center">
          <span className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 bg-amber-50 py-1.5 px-4 rounded-xl border border-amber-200">
            {gameState.lastActionDescription}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!engine.canUndo()}
            onClick={handleUndo}
            title="Undur semula pergerakan terakhir"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 disabled:opacity-30 cursor-pointer transition active:scale-95 shadow-xs"
          >
            <Undo2 className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Undur (Undo)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Sambung permainan' : 'Jeda permainan'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer transition shadow-xs"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-slate-700" />}
            <span className="hidden sm:inline">{isPaused ? 'Sambung' : 'Jeda'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            title="Mula semula permainan"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleEndGameConfirm}
            title="Tamatkan permainan & simpan markah"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 cursor-pointer transition shadow-xs"
          >
            <StopCircle className="w-4 h-4 text-rose-600" />
            <span>Tamat</span>
          </button>
        </div>
      </div>

      {/* Main Play Area - Fits in Viewport Without Scrolling */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
        {/* Left Column: Big 100-Square Game Board (8 cols) */}
        <div className="lg:col-span-8 h-full flex items-center justify-center min-h-0 overflow-hidden">
          <GameBoard
            teams={gameState.teams}
            activeTeamIndex={gameState.activeTeamIndex}
            activeEncounter={gameState.snakeLadderEncounter}
          />
        </div>

        {/* Right Column: Large Dice Controls & Large Scoreboard (4 cols) */}
        <div className="lg:col-span-4 h-full flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Big Digital Dice Roller */}
          <div className="shrink-0">
            <DiceRoller
              value={gameState.diceValue}
              isRolling={isRolling}
              disabled={
                isControlsDisabled ||
                gameState.phase === 'QUESTION_ACTIVE' ||
                gameState.phase === 'ANSWER_CONFIRMED'
              }
              onRoll={handleRollDice}
              activeTeamName={activeTeam.name}
              activeTeamColor={activeTeam.color}
            />
          </div>

          {/* Big Live Scoreboard - Takes Remaining Height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Scoreboard
              teams={gameState.teams}
              activeTeamIndex={gameState.activeTeamIndex}
            />
          </div>
        </div>
      </div>

      {/* Big Question Answering Modal */}
      {(gameState.phase === 'QUESTION_ACTIVE' || gameState.phase === 'ANSWER_CONFIRMED') &&
        gameState.currentQuestion && (
          <QuestionModal
            question={gameState.currentQuestion}
            activeTeam={activeTeam}
            diceRoll={gameState.diceValue || 1}
            timerSeconds={settings.questionTimerSeconds}
            penaltyRule={settings.penaltyRule}
            selectedAnswer={gameState.selectedAnswer}
            isConfirmed={gameState.phase === 'ANSWER_CONFIRMED'}
            isCorrect={gameState.isAnswerCorrect}
            onSelectAnswer={handleSelectAnswer}
            onConfirm={handleConfirmAnswer}
            onAdvance={handleApplyMovement}
          />
        )}

      {/* Victory Celebration Modal */}
      {gameState.phase === 'VICTORY' && winningTeam && (
        <VictoryModal
          winningTeam={winningTeam}
          allTeams={gameState.teams}
          onPlayAgain={onPlayAgain}
          onNewGame={onNewGameSetup}
          onReturnDashboard={onReturnDashboard}
        />
      )}
    </div>
  );
};
