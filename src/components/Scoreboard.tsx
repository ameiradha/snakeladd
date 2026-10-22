import React, { useState } from 'react';
import { Team } from '../types';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';

interface ScoreboardProps {
  teams: Team[];
  activeTeamIndex: number;
  compact?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  teams,
  activeTeamIndex,
  compact = false,
}) => {
  const [sortBy, setSortBy] = useState<'position' | 'accuracy'>('position');

  // Sorted teams copy
  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'position') {
      return b.currentSquare - a.currentSquare;
    }
    const accA = a.attemptsCount > 0 ? (a.correctCount / a.attemptsCount) * 100 : 0;
    const accB = b.attemptsCount > 0 ? (b.correctCount / b.attemptsCount) * 100 : 0;
    return accB - accA;
  });

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header and Sorting Toggle */}
      <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-100">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
            Papan Skor Terkini
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSortBy('position')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              sortBy === 'position'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Petak
          </button>
          <button
            type="button"
            onClick={() => setSortBy('accuracy')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              sortBy === 'accuracy'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ketepatan
          </button>
        </div>
      </div>

      {/* Large Teams Ranking List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 space-y-2 pr-1">
        {sortedTeams.map((team, rankIndex) => {
          const isActive = teams[activeTeamIndex]?.id === team.id;
          const accuracy =
            team.attemptsCount > 0
              ? Math.round((team.correctCount / team.attemptsCount) * 100)
              : 0;

          return (
            <div
              key={team.id}
              className={`py-3 px-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-amber-100/70 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              {/* Rank and Team Token/Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base sm:text-lg font-black text-slate-600 tabular-nums w-6 text-center">
                  #{rankIndex + 1}
                </span>
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xl shadow-md shrink-0"
                  style={{ backgroundColor: team.color }}
                >
                  {team.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[130px] sm:max-w-[180px]">
                      {team.name}
                    </span>
                    {team.isSkippedForTurn && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold border border-rose-300">
                        LANGKAU
                      </span>
                    )}
                  </div>
                  {team.members && team.members.length > 0 && !compact && (
                    <span className="text-xs text-slate-500 truncate block max-w-[160px]">
                      {team.members.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats: Square, Correct/Wrong, Accuracy */}
              <div className="flex items-center gap-3.5 shrink-0 text-right">
                {/* Square badge */}
                <div className="text-center px-2 py-1 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-black text-amber-800 block">Petak</span>
                  <span className="text-base sm:text-xl font-black text-amber-700 tabular-nums">
                    {team.currentSquare}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>

                {/* Score breakdown */}
                {!compact && (
                  <div className="hidden sm:flex flex-col items-center justify-center text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold tabular-nums">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {team.correctCount} Betul
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-bold tabular-nums">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      {team.incorrectCount} Salah
                    </span>
                  </div>
                )}

                {/* Accuracy */}
                <div className="text-center min-w-[50px] px-2 py-1 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-600 block">Ketepatan</span>
                  <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                    {team.attemptsCount > 0 ? `${accuracy}%` : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
