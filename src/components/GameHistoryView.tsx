import React, { useState } from 'react';
import { GameRecord } from '../types';
import { History, Trophy, Trash2, Download, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface GameHistoryViewProps {
  history: GameRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const GameHistoryView: React.FC<GameHistoryViewProps> = ({
  history,
  onDeleteRecord,
  onClearAll,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExportCSV = (record: GameRecord) => {
    let csv = `Game Date,Quiz Title,Winner,Duration (sec),Rule\n`;
    csv += `"${record.date}","${record.quizTitle}","${record.winner}",${record.durationSeconds},"${record.winningRule}"\n\n`;
    csv += `Rank,Team Name,Final Square,Correct Answers,Incorrect Answers,Accuracy (%)\n`;

    const sortedTeams = [...record.teams].sort((a, b) => b.finalSquare - a.finalSquare);
    sortedTeams.forEach((t, idx) => {
      csv += `${idx + 1},"${t.name}",${t.finalSquare},${t.correctCount},${t.incorrectCount},${t.accuracy}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_game_results_${record.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllConfirm = () => {
    if (confirm('Are you sure you want to permanently clear all completed game history records?')) {
      onClearAll();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            Rekod Sejarah Permainan / History ({history.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Semak keputusan perlawanan kelas terdahulu, juara podium, dan statistik setiap kumpulan.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Padam Semua Sejarah</span>
          </button>
        )}
      </div>

      {/* History Records List */}
      {history.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-3 shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">Tiada Rekod Permainan Lagi</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mulakan kuiz ular dan tangga di dalam kelas sehingga mencapai petak 100. Keputusan dan markah akan disimpan secara automatik di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const isExpanded = expandedId === record.id;
            const dateStr = new Date(record.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const mins = Math.floor(record.durationSeconds / 60);
            const secs = record.durationSeconds % 60;

            return (
              <div
                key={record.id}
                className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4 transition hover:border-amber-400 shadow-sm"
              >
                {/* Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {dateStr}
                      </span>
                      <span aria-hidden="true">&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {record.quizTitle}
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Juara: {record.winner} 🏆
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-600 font-semibold">{record.teams.length} Kumpulan</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500">Peraturan: {record.winningRule}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportCSV(record)}
                      title="Muat Turun CSV"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      title="Padam Rekod"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                    >
                      <span>{isExpanded ? 'Tutup Kedudukan' : 'Lihat Kedudukan'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Standings Table */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-200 pb-2">
                          <th className="py-2 font-black">Kedudukan</th>
                          <th className="py-2 font-black">Kumpulan</th>
                          <th className="py-2 font-black text-center">Petak Akhir</th>
                          <th className="py-2 font-black text-center">Betul</th>
                          <th className="py-2 font-black text-center">Salah</th>
                          <th className="py-2 font-black text-right">Ketepatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {record.teams
                          .slice()
                          .sort((a, b) => b.finalSquare - a.finalSquare)
                          .map((t, idx) => (
                            <tr key={t.name} className="hover:bg-slate-50">
                              <td className="py-2.5 font-black text-slate-700">#{idx + 1}</td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 shadow-xs"
                                    style={{ backgroundColor: t.color }}
                                  >
                                    {t.icon}
                                  </span>
                                  <span className="font-extrabold text-slate-900">{t.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-black text-amber-700">
                                {t.finalSquare} / 100
                              </td>
                              <td className="py-2.5 text-center text-emerald-600 font-bold">
                                {t.correctCount}
                              </td>
                              <td className="py-2.5 text-center text-rose-600 font-bold">
                                {t.incorrectCount}
                              </td>
                              <td className="py-2.5 text-right font-black text-slate-800">
                                {t.accuracy}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
