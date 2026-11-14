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
    <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-slate-200 p-2 sm:p-3 lg:p-4 shadow-md lg:shadow-xl flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header and Sorting Toggle */}
      <div className="flex items-center justify-between pb-1.5 sm:pb-2.5 border-b border-slate-100 shrink-0 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          <h3 className="font-black text-slate-900 text-xs sm:text-sm lg:text-base tracking-tight truncate">
            Papan Skor
          </h3>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] sm:text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setSortBy('position')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition cursor-pointer ${
              sortBy === 'position'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Petak
          </button>
          <button
            type="button"
            onClick={() => setSortBy('accuracy')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition cursor-pointer ${
              sortBy === 'accuracy'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ketepatan
          </button>
        </div>
      </div>

      {/* Teams Ranking List - 2-col grid on portrait mobile, single col on landscape/desktop */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-1.5 grid grid-cols-2 landscape:flex landscape:flex-col lg:flex lg:flex-col gap-1.5 lg:gap-2 pr-0.5 content-start">
        {sortedTeams.map((team, rankIndex) => {
          const isActive = teams[activeTeamIndex]?.id === team.id;
          const accuracy =
            team.attemptsCount > 0
              ? Math.round((team.correctCount / team.attemptsCount) * 100)
              : 0;

          return (
            <div
              key={team.id}
              className={`py-1.5 px-2 lg:py-2 lg:px-2.5 rounded-xl lg:rounded-2xl transition-all flex items-center justify-between gap-1.5 lg:gap-2.5 shrink-0 ${
                isActive
                  ? 'bg-amber-100/80 border-2 border-amber-400 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              {/* Rank and Team Token/Name */}
              <div className="flex items-center gap-1.5 lg:gap-2.5 min-w-0">
                <span className="text-[11px] lg:text-sm font-black text-slate-500 tabular-nums w-4 lg:w-5 text-center shrink-0">
                  #{rankIndex + 1}
                </span>
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-lg shadow-xs shrink-0"
                  style={{ backgroundColor: team.color }}
                >
                  {team.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-[11px] sm:text-xs lg:text-sm text-slate-900 truncate">
                      {team.name}
                    </span>
                    {team.isSkippedForTurn && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-rose-100 text-rose-700 font-extrabold border border-rose-300 shrink-0">
                        SKIP
                      </span>
                    )}
                  </div>
                  {team.members && team.members.length > 0 && !compact && (
                    <span className="hidden lg:block text-[11px] text-slate-500 truncate max-w-[140px]">
                      {team.members.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats: Square, Correct/Wrong, Accuracy */}
              <div className="flex items-center gap-1.5 lg:gap-2 shrink-0 text-right">
                {/* Square badge */}
                <div className="text-center px-1.5 lg:px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="hidden lg:block text-[9px] uppercase font-black text-amber-800 leading-none">
                    Petak
                  </span>
                  <span className="text-xs sm:text-sm lg:text-base font-black text-amber-700 tabular-nums">
                    {team.currentSquare}
                    <span className="hidden xl:inline text-[10px] text-slate-400 font-normal">/100</span>
                  </span>
                </div>

                {/* Score breakdown - Desktop only */}
                {!compact && (
                  <div className="hidden xl:flex flex-col items-center justify-center text-[11px]">
                    <span className="flex items-center gap-0.5 text-emerald-700 font-bold tabular-nums">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {team.correctCount}
                    </span>
                    <span className="flex items-center gap-0.5 text-rose-700 font-bold tabular-nums">
                      <XCircle className="w-3 h-3 text-rose-500" />
                      {team.incorrectCount}
                    </span>
                  </div>
                )}

                {/* Accuracy */}
                <div className="hidden sm:block text-center min-w-[38px] lg:min-w-[44px] px-1.5 py-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="hidden lg:block text-[9px] uppercase font-black text-slate-600 leading-none">
                    Tepat
                  </span>
                  <span className="text-[11px] lg:text-xs font-black text-slate-900 tabular-nums">
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
