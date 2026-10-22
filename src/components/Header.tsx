import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Play, Maximize, Minimize, Languages } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'game_setup' | 'active_game' | 'quiz_library' | 'game_history';
  onNavigate: (view: 'dashboard' | 'game_setup' | 'quiz_library' | 'game_history') => void;
  onQuickStart: () => void;
  isClassroomMode: boolean;
  onToggleClassroomMode: () => void;
  language: 'en' | 'ms';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onQuickStart,
  isClassroomMode,
  onToggleClassroomMode,
  language,
  onToggleLanguage,
}) => {
  // Classroom Mode top bar
  if (isClassroomMode) {
    return (
      <header className="flex items-center justify-between px-4 py-2 bg-white/95 border-b-2 border-slate-200 shadow-xs z-30">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-amber-600 tracking-tight flex items-center gap-1.5">
            <span>🐍</span>
            <span>SNAKE LADD</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            &bull; Mod Tayangan Projektor Bilik Darjah
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleClassroomMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
          >
            <Minimize className="w-3.5 h-3.5 text-amber-600" />
            <span>Keluar Mod Projektor</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b-2 border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Single text wordmark */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className="text-lg font-black tracking-tight text-slate-900 hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
      >
        <span className="text-2xl">🐍</span>
        <span className="bg-gradient-to-r from-emerald-600 via-amber-600 to-amber-500 bg-clip-text text-transparent font-black text-xl">
          Snake Ladd
        </span>
      </button>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'dashboard' ? 'text-amber-600 font-black' : ''
          }`}
        >
          Papan Pemuka
        </button>
        <button
          type="button"
          onClick={() => onNavigate('game_setup')}
          className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'game_setup' || currentView === 'active_game' ? 'text-amber-600 font-black' : ''
          }`}
        >
          Mula Main
        </button>
        <button
          type="button"
          onClick={() => onNavigate('quiz_library')}
          className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'quiz_library' ? 'text-amber-600 font-black' : ''
          }`}
        >
          Koleksi Kuiz
        </button>
        <button
          type="button"
          onClick={() => onNavigate('game_history')}
          className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'game_history' ? 'text-amber-600 font-black' : ''
          }`}
        >
          Rekod Perlawanan
        </button>
      </nav>

      {/* Zone 3: 1 primary action + minimal secondary controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <PWAInstallButton />

        <button
          type="button"
          onClick={onToggleLanguage}
          title="Tukar bahasa"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer transition whitespace-nowrap shrink-0"
        >
          <Languages className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'en' ? 'BM' : 'EN'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleClassroomMode}
          title="Mod Projektor Skrin Penuh"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer transition whitespace-nowrap shrink-0"
        >
          <Maximize className="w-3.5 h-3.5 text-amber-600" />
          <span>Mod Projektor</span>
        </button>

        <button
          type="button"
          onClick={onQuickStart}
          className="px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 rounded-xl shadow-md transition active:scale-95 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ring-2 ring-amber-400/80"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Main Segera</span>
        </button>
      </div>
    </header>
  );
};
