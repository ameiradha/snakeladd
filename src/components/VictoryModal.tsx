import React, { useEffect } from 'react';
import { Team } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Plus, Home } from 'lucide-react';

interface VictoryModalProps {
  winningTeam: Team;
  allTeams: Team[];
  onPlayAgain: () => void;
  onNewGame: () => void;
  onReturnDashboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winningTeam,
  allTeams,
  onPlayAgain,
  onNewGame,
  onReturnDashboard,
}) => {
  // Fire multi-stage celebratory confetti
  useEffect(() => {
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ef4444'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      // Fallback if canvas is unavailable
    }
  }, []);

  const sortedTeams = [...allTeams].sort((a, b) => b.currentSquare - a.currentSquare);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border-4 border-amber-400 rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy & Winner Badge */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex p-4 rounded-3xl bg-amber-100 border-2 border-amber-300 shadow-md">
            <Trophy className="w-16 h-16 text-amber-500 animate-bounce" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-600 block">
              CHAMPIONS OF SNAKE LADD! / JUARA SNAKE LADD! 🐍
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-1">
              {winningTeam.name}
            </h2>
            {winningTeam.members && winningTeam.members.length > 0 && (
              <p className="text-sm font-medium text-slate-600 mt-1">
                Star Pupils: {winningTeam.members.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Final Standings Podium / Ranking */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-left max-h-60 overflow-y-auto space-y-2">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Kedudukan Akhir / Final Standings
          </h4>
          <div className="divide-y divide-slate-200">
            {sortedTeams.map((t, idx) => {
              const accuracy =
                t.attemptsCount > 0 ? Math.round((t.correctCount / t.attemptsCount) * 100) : 0;
              return (
                <div key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-700 tabular-nums w-5 text-base">
                      #{idx + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.icon}
                    </div>
                    <span className="font-extrabold text-slate-900">{t.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="font-black text-amber-600 tabular-nums text-base">
                      Petak {t.currentSquare}/100
                    </span>
                    <span className="text-slate-500 font-bold tabular-nums text-xs">
                      Ketepatan: {t.attemptsCount > 0 ? `${accuracy}%` : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Main Lagi (Pasukan Sama)</span>
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer transition"
          >
            <Plus className="w-5 h-5" />
            <span>Permainan Baru</span>
          </button>

          <button
            type="button"
            onClick={onReturnDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition"
          >
            <Home className="w-5 h-5" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
