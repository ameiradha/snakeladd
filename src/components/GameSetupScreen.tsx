import React, { useState } from 'react';
import { Quiz, Team, WinningRule, WrongAnswerPenalty, GameSettings } from '../types';
import { TeamManager } from './TeamManager';
import { Play, Sparkles, FileText, Plus, Check } from 'lucide-react';

interface GameSetupScreenProps {
  quizzes: Quiz[];
  teams: Team[];
  settings: GameSettings;
  selectedQuizId: string | null;
  onSelectQuizId: (id: string) => void;
  onTeamsChange: (teams: Team[]) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onStartGame: (quiz: Quiz, teams: Team[], settings: GameSettings) => void;
  onOpenCreateQuiz: () => void;
  onOpenAIGenerator: () => void;
  onOpenTextImporter: () => void;
  onOpenJSONBackup: () => void;
  onCancel: () => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({
  quizzes,
  teams,
  settings,
  selectedQuizId,
  onSelectQuizId,
  onTeamsChange,
  onSettingsChange,
  onStartGame,
  onOpenCreateQuiz,
  onOpenAIGenerator,
  onOpenTextImporter,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'quiz' | 'rules'>('teams');

  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0] || null;

  const handleLaunchGame = () => {
    if (!activeQuiz) {
      alert('Sila pilih atau bina kuiz terlebih dahulu sebelum memulakan permainan.');
      return;
    }
    if (teams.length < 2) {
      alert('Sekurang-kurangnya 2 kumpulan diperlukan untuk memulakan perlawanan.');
      return;
    }
    if (activeQuiz.questions.length === 0) {
      alert('Kuiz yang dipilih tiada soalan. Sila tambah soalan dahulu.');
      return;
    }
    onStartGame(activeQuiz, teams, settings);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Setup Title Bar - Bright Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Persediaan Perlawanan Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Tetapkan kumpulan murid, pilih soalan kurikulum, dan tentukan peraturan perlawanan bilik darjah.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLaunchGame}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md cursor-pointer transition active:scale-95 ring-2 ring-amber-400"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>MULAKAN PERLAWANAN KELAS</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`py-3 px-5 rounded-t-2xl transition cursor-pointer border-b-3 ${
            activeTab === 'teams'
              ? 'border-amber-500 text-amber-700 bg-amber-50 font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Kumpulan Murid ({teams.length} Kumpulan)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`py-3 px-5 rounded-t-2xl transition cursor-pointer border-b-3 ${
            activeTab === 'quiz'
              ? 'border-amber-500 text-amber-700 bg-amber-50 font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Pilihan Kuiz ({activeQuiz ? activeQuiz.title : 'Belum Dipilih'})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`py-3 px-5 rounded-t-2xl transition cursor-pointer border-b-3 ${
            activeTab === 'rules'
              ? 'border-amber-500 text-amber-700 bg-amber-50 font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Peraturan &amp; Denda
        </button>
      </div>

      {/* Tab Panels - Bright Theme */}
      {activeTab === 'teams' && (
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-4">
          <TeamManager teams={teams} onTeamsChange={onTeamsChange} />
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm transition active:scale-95"
            >
              Seterusnya: Pilih Kuiz &rarr;
            </button>
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pilih Kuiz Untuk Perlawanan Ini</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Pilih kuiz sedia ada, jana dengan AI, atau import dari teks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenAIGenerator}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Jana AI</span>
              </button>
              <button
                type="button"
                onClick={onOpenTextImporter}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer transition"
              >
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Import Teks</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateQuiz}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer transition"
              >
                <Plus className="w-4 h-4 text-slate-700" />
                <span>Bina Baru</span>
              </button>
            </div>
          </div>

          {/* List of Available Quizzes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {quizzes.map((q) => {
              const isSelected = activeQuiz?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuizId(q.id)}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-extrabold text-amber-700">{q.subject}</span>
                        <span>&bull;</span>
                        <span>{q.yearLevel}</span>
                        <span>&bull;</span>
                        <span>{q.language}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 line-clamp-1">{q.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {q.description || q.topic}
                      </p>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'border-2 border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{q.questions.length} Soalan</span>
                    <span className="font-extrabold text-amber-700">
                      {isSelected ? '✓ Kuiz Dipilih' : 'Klik untuk pilih'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('teams')}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              &larr; Kembali ke Kumpulan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm transition active:scale-95"
            >
              Seterusnya: Peraturan Perlawanan &rarr;
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-5">
          <h3 className="text-lg font-black text-slate-900">Peraturan Papan &amp; Denda</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Winning Condition */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Syarat Kemenangan
              </label>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, winningRule: 'REACH_OR_PASS' })}
                  className={`w-full p-3.5 rounded-xl border-2 text-left cursor-pointer transition ${
                    settings.winningRule === 'REACH_OR_PASS'
                      ? 'bg-amber-100 border-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-sm">Pilihan B: Sampai atau Melepasi (Disyorkan)</span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    Kumpulan pertama yang mencecah atau melepasi petak 100 terus menang serta-merta.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, winningRule: 'EXACT' })}
                  className={`w-full p-3.5 rounded-xl border-2 text-left cursor-pointer transition ${
                    settings.winningRule === 'EXACT'
                      ? 'bg-amber-100 border-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-sm">Pilihan A: Tepat Pada Petak 100</span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    Mesti melempar dadu genap pada bilangan yang diperlukan untuk mendarat tepat di 100.
                  </span>
                </button>
              </div>
            </div>

            {/* Wrong-Answer Penalty */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Denda Jawapan Salah
              </label>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, penaltyRule: 'NO_MOVE' })}
                  className={`w-full p-3 rounded-xl border-2 text-left cursor-pointer transition ${
                    settings.penaltyRule === 'NO_MOVE'
                      ? 'bg-amber-100 border-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-sm">Denda A: Kekal di Petak (Tiada Pergerakan)</span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    Kumpulan kekal di petak semasa tanpa pergerakan token.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, penaltyRule: 'LOSE_TURN' })}
                  className={`w-full p-3 rounded-xl border-2 text-left cursor-pointer transition ${
                    settings.penaltyRule === 'LOSE_TURN'
                      ? 'bg-amber-100 border-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-sm">Denda B: Hilang Giliran Seterusnya</span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    Kumpulan kekal dan akan dilangkau pada pusingan berikutnya.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, penaltyRule: 'TEACHER_CHOICE' })}
                  className={`w-full p-3 rounded-xl border-2 text-left cursor-pointer transition ${
                    settings.penaltyRule === 'TEACHER_CHOICE'
                      ? 'bg-amber-100 border-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-sm">Denda C: Pilihan Guru</span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    Guru menentukan denda secara langsung mengikut kesesuaian bilik darjah.
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              &larr; Kembali ke Kuiz
            </button>
            <button
              type="button"
              onClick={handleLaunchGame}
              className="px-8 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md cursor-pointer transition active:scale-95 ring-2 ring-amber-400"
            >
              Lancarkan Permainan Sekarang!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
