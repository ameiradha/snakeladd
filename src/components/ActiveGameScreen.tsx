import React, { useState, useEffect } from 'react';
import { Quiz, Team, GameSettings, GameRecord } from '../types';
import { GameEngine, GameEngineState } from '../game/engine';
import { GameBoard } from './GameBoard';
import { DiceRoller } from './DiceRoller';
import { QuestionModal } from './QuestionModal';
import { Scoreboard } from './Scoreboard';
import { VictoryModal } from './VictoryModal';
import { LADDERS, SNAKES } from '../game/constants';
import {
  RotateCcw,
  Undo2,
  Pause,
  Play,
  StopCircle,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  AlertTriangle,
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
  const [inspectSquare, setInspectSquare] = useState<number | null>(null);
  const [overrideSelectedTeamId, setOverrideSelectedTeamId] = useState<string>('');

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
            onSquareClick={(num) => {
              setInspectSquare(num);
              setOverrideSelectedTeamId(activeTeam.id);
            }}
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

      {/* Classroom Snake / Ladder Encounter Alert Banner Overlay */}
      {gameState.snakeLadderEncounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in duration-200">
          <div
            className={`max-w-xl w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 transform transition-all scale-100 ${
              gameState.snakeLadderEncounter.type === 'ladder'
                ? 'bg-gradient-to-b from-amber-50 via-white to-emerald-50 border-amber-400 ring-8 ring-amber-400/20'
                : 'bg-gradient-to-b from-rose-50 via-white to-orange-50 border-rose-500 ring-8 ring-rose-500/20'
            }`}
          >
            {/* Mascot / Icon Badge */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg animate-bounce ${
                  gameState.snakeLadderEncounter.type === 'ladder'
                    ? 'bg-gradient-to-tr from-amber-400 to-emerald-400 text-white ring-4 ring-amber-300'
                    : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white ring-4 ring-rose-300'
                }`}
              >
                {gameState.snakeLadderEncounter.type === 'ladder' ? '🪜' : '🐍'}
              </div>
            </div>

            {/* Title */}
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest mb-2 shadow-xs ${
                gameState.snakeLadderEncounter.type === 'ladder'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {gameState.snakeLadderEncounter.type === 'ladder'
                ? '✨ NAIK TANGGA PANTAS!'
                : '⚠️ AWAS! KEPALA ULAR!'}
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {gameState.snakeLadderEncounter.type === 'ladder'
                ? 'Tahniah! Memanjat Tangga!'
                : 'Aduhh! Dipatuk Ular!'}
            </h2>

            {/* Team Info */}
            <div className="flex items-center justify-center gap-3 mb-6 bg-slate-100/80 py-3 px-6 rounded-2xl border border-slate-200">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-white shadow-xs font-bold"
                style={{ backgroundColor: activeTeam.color }}
              >
                {activeTeam.icon}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800">
                {activeTeam.name}
              </span>
            </div>

            {/* Square Transition visual */}
            <div className="flex items-center justify-center gap-4 text-center my-4">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-sm min-w-[100px]">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Petak Mula</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {gameState.snakeLadderEncounter.from}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-2xl font-black ${
                    gameState.snakeLadderEncounter.type === 'ladder'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  ➔
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {gameState.snakeLadderEncounter.type === 'ladder' ? 'PANJAT' : 'GELONGSOR'}
                </span>
              </div>

              <div
                className={`p-3 rounded-2xl border-2 shadow-md min-w-[100px] ${
                  gameState.snakeLadderEncounter.type === 'ladder'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                    : 'bg-rose-100 border-rose-400 text-rose-950'
                }`}
              >
                <div className="text-[11px] font-bold uppercase opacity-80">Petak Destinasi</div>
                <div className="text-2xl sm:text-3xl font-black">
                  {gameState.snakeLadderEncounter.to}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
              Pergerakan automatik sedang berlangsung di atas papan permainan...
            </p>
          </div>
        </div>
      )}

      {/* Teacher Square Inspection Modal */}
      {inspectSquare !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                  {inspectSquare}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Maklumat Petak {inspectSquare}</h3>
                  <p className="text-xs text-slate-500">Kawalan Guru / Manual Square Control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectSquare(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Special attributes of square */}
            <div className="space-y-3 mb-5">
              {(() => {
                const ladderStart = LADDERS.find((l) => l.start === inspectSquare);
                const ladderEnd = LADDERS.find((l) => l.end === inspectSquare);
                const snakeStart = SNAKES.find((s) => s.start === inspectSquare);
                const snakeEnd = SNAKES.find((s) => s.end === inspectSquare);

                return (
                  <>
                    {ladderStart && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3">
                        <span className="text-2xl">🪜</span>
                        <div>
                          <div className="font-black text-sm">Kaki Tangga (Petak {ladderStart.start})</div>
                          <div className="text-xs font-semibold text-amber-800">
                            Pemain yang mendarat di sini akan terus memanjat ke <strong>Petak {ladderStart.end}</strong>!
                          </div>
                        </div>
                      </div>
                    )}

                    {ladderEnd && (
                      <div className="p-3 rounded-2xl bg-yellow-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                        <span className="text-2xl">🪜</span>
                        <div>
                          <div className="font-black text-sm">Puncak Tangga (Petak {ladderEnd.end})</div>
                          <div className="text-xs text-amber-800">
                            Destinasi tangga dari Petak {ladderEnd.start}.
                          </div>
                        </div>
                      </div>
                    )}

                    {snakeStart && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                        <span className="text-2xl">🐍</span>
                        <div>
                          <div className="font-black text-sm">Kepala Ular (Petak {snakeStart.start})</div>
                          <div className="text-xs font-semibold text-rose-800">
                            Pemain yang mendarat di sini akan dipatuk dan menggelongsor turun ke <strong>Petak {snakeStart.end}</strong>!
                          </div>
                        </div>
                      </div>
                    )}

                    {snakeEnd && (
                      <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-rose-900 flex items-center gap-3">
                        <span className="text-2xl">🐍</span>
                        <div>
                          <div className="font-black text-sm">Ekor Ular (Petak {snakeEnd.end})</div>
                          <div className="text-xs text-rose-800">
                            Hujung ekor ular dari Petak {snakeEnd.start}.
                          </div>
                        </div>
                      </div>
                    )}

                    {!ladderStart && !ladderEnd && !snakeStart && !snakeEnd && inspectSquare !== 1 && inspectSquare !== 100 && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                        Petak biasa tanpa halangan ular atau bantuan tangga.
                      </div>
                    )}

                    {inspectSquare === 100 && (
                      <div className="p-3 rounded-2xl bg-amber-100 border border-amber-400 text-amber-950 font-black text-sm flex items-center gap-2">
                        <span>🏆</span> Petak Penamat (Garisan Kemenangan)!
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Teams currently occupying this square */}
              <div>
                <span className="text-xs font-black text-slate-600 block mb-1">
                  Kumpulan Di Petak Ini:
                </span>
                <div className="flex flex-wrap gap-2">
                  {gameState.teams.filter((t) => t.currentSquare === inspectSquare).length > 0 ? (
                    gameState.teams
                      .filter((t) => t.currentSquare === inspectSquare)
                      .map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black text-white shadow-xs"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.icon} {t.name}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tiada kumpulan di petak ini.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Teacher Manual Action: Move team to this square */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Tindakan Guru: Pindahkan Kumpulan ke Petak {inspectSquare}
              </label>
              <div className="flex gap-2">
                <select
                  value={overrideSelectedTeamId || activeTeam.id}
                  onChange={(e) => setOverrideSelectedTeamId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  {gameState.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Kini di #{t.currentSquare})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const targetTeamId = overrideSelectedTeamId || activeTeam.id;
                    engine.overrideTeamSquare(targetTeamId, inspectSquare);
                    setInspectSquare(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition active:scale-95"
                >
                  Pindahkan
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                * Berguna untuk demonstrasi atau membetulkan kedudukan secara manual.
              </p>
            </div>
          </div>
        </div>
      )}

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
