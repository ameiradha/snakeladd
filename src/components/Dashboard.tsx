import React from 'react';
import { Quiz, GameRecord } from '../types';
import { Play, Plus, BookOpen, History, Settings, Sparkles, Download, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  quizzes: Quiz[];
  history: GameRecord[];
  onPlayGame: () => void;
  onQuickStart: () => void;
  onCreateQuiz: () => void;
  onOpenLibrary: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenAIGenerator: () => void;
  onOpenTextImporter: () => void;
  onOpenJSONBackup: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quizzes,
  history,
  onPlayGame,
  onQuickStart,
  onCreateQuiz,
  onOpenLibrary,
  onOpenHistory,
  onOpenSettings,
  onOpenAIGenerator,
  onOpenTextImporter,
  onOpenJSONBackup,
}) => {
  const recentQuiz = quizzes[0] || null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Hero Classroom Banner - Bright Theme */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 via-white to-sky-50 border-3 border-amber-300 p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-widest">
            <span>Arena Kuiz Interaktif Sekolah Rendah</span>
            <span aria-hidden="true">&bull;</span>
            <span>Skrin Projektor Bilik Darjah</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-3">
            <span className="text-4xl sm:text-6xl drop-shadow-sm">🐍</span>
            <span>Snake Ladd</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            Tukarkan sesi ulangkaji kurikulum kepada perlawanan dam ular yang ceria dan mendebarkan! Guru mengawal giliran murid secara interaktif di skrin projektor tanpa memerlukan akaun murid.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onQuickStart}
              className="px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md cursor-pointer transition active:scale-95 flex items-center gap-2 ring-2 ring-amber-400"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>MULA MAIN SEGERA (2 KUMPULAN)</span>
            </button>

            <button
              type="button"
              onClick={onPlayGame}
              className="px-5 py-3.5 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 transition cursor-pointer active:scale-95 shadow-xs"
            >
              Tetapan Perlawanan Kumpulan
            </button>

            <button
              type="button"
              onClick={onOpenAIGenerator}
              className="px-4 py-3.5 rounded-2xl font-bold text-sm bg-amber-100/70 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Jana Kuiz AI</span>
            </button>
          </div>
        </div>

        {/* Decorative board game snake motif in background */}
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none text-[150px] select-none">
          🐍
        </div>
      </div>

      {/* Classroom Status & Quick Metrics Row (Bright theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-black block">Kuiz Tersimpan</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {quizzes.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">koleksi</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-black block">Permainan Selesai</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {history.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">rekod</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-black block">Kuiz Terkini</span>
          <span className="text-sm font-extrabold text-amber-700 truncate block">
            {recentQuiz ? recentQuiz.title : 'Belum ada kuiz'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block truncate">
            {recentQuiz ? `${recentQuiz.questions.length} soalan tersedia` : 'Sedia untuk dibina'}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-black block">Sistem Luar Talian</span>
          <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>IndexedDB Aktif</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">PWA Tersimpan Luar Talian</span>
        </div>
      </div>

      {/* 5 Core Feature Cards Grid - Bright Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. PLAY GAME */}
        <div
          onClick={onPlayGame}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 group-hover:scale-110 transition shadow-xs">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Mula Permainan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Lancarkan perlawanan kuiz bersama 2 hingga 12+ kumpulan murid. Tetapkan nama kumpulan, warna, syarat kemenangan, dan denda.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Konfigurasi &amp; Mula &rarr;</span>
          </div>
        </div>

        {/* 2. CREATE QUIZ */}
        <div
          onClick={onCreateQuiz}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition shadow-xs">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Bina Kuiz Baru
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Cipta soalan secara manual merangkumi Aneka Pilihan (MCQ), Benar/Palsu, atau Jawapan Pendek lengkap dengan penerangan.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Buka Editor Kuiz &rarr;</span>
          </div>
        </div>

        {/* 3. QUIZ LIBRARY */}
        <div
          onClick={onOpenLibrary}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 group-hover:scale-110 transition shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Koleksi Kuiz
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Cari, salin, sunting, atau pratonton kuiz sedia ada. Dilengkapi kuiz Sains, Matematik, dan Pengetahuan Am dalam Bahasa Melayu &amp; English.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Lihat {quizzes.length} Kuiz &rarr;</span>
          </div>
        </div>

        {/* 4. GAME HISTORY */}
        <div
          onClick={onOpenHistory}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 group-hover:scale-110 transition shadow-xs">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Rekod Perlawanan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Semak keputusan lepas, podium juara, peratusan ketepatan kumpulan, dan eksport laporan markah ke format CSV.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Lihat {history.length} Rekod &rarr;</span>
          </div>
        </div>

        {/* 5. SETTINGS */}
        <div
          onClick={onOpenSettings}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 group-hover:scale-110 transition shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Tetapan Aplikasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Tukar bahasa, kesan bunyi, syarat menang, masa menjawab, dan aktifkan Mod Projektor Bilik Darjah.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Konfigurasi Tetapan &rarr;</span>
          </div>
        </div>

        {/* JSON Backup Card */}
        <div
          onClick={onOpenJSONBackup}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 group-hover:scale-110 transition shadow-xs">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition">
              Sandaran &amp; Pulih JSON
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Eksport dan pulihkan semua kuiz, rekod dan tetapan untuk dipindahkan antara komputer guru atau peranti bilik darjah.
            </p>
          </div>
          <div className="pt-4 text-xs font-black text-amber-700 flex items-center gap-1">
            <span>Sandaran / Eksport JSON &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
