import React, { useState } from 'react';
import { GameSettings, WinningRule, WrongAnswerPenalty } from '../types';
import { Settings, Volume2, VolumeX, Monitor, Languages, Zap, X, Clock } from 'lucide-react';
import { soundManager } from '../services/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [current, setCurrent] = useState<GameSettings>({ ...settings });

  const handleSoundToggle = (val: boolean) => {
    setCurrent({ ...current, soundEnabled: val });
    soundManager.setEnabled(val);
    if (val) soundManager.playClick();
  };

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">Tetapan Aplikasi / Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Language Selection */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Bahasa / Interface Language</span>
                <span className="text-xs text-slate-500">English or Bahasa Melayu</span>
              </div>
            </div>
            <select
              value={current.language}
              onChange={(e) => setCurrent({ ...current, language: e.target.value as any })}
              className="bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 cursor-pointer shadow-sm"
            >
              <option value="en">English</option>
              <option value="ms">Bahasa Melayu</option>
            </select>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              {current.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="text-sm font-bold text-slate-900 block">Kesan Bunyi / Sound Effects</span>
                <span className="text-xs text-slate-500">
                  Synthesized board game chimes, dice rattles, and fanfares
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={current.soundEnabled}
                onChange={(e) => handleSoundToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Classroom Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Mod Projektor Bilik Darjah</span>
                <span className="text-xs text-slate-500">
                  Hides secondary navigation bars to maximize board area for projectors
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={current.classroomMode}
                onChange={(e) => setCurrent({ ...current, classroomMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Default Winning Rule */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Peraturan Menang / Default Winning Rule
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCurrent({ ...current, winningRule: 'REACH_OR_PASS' })}
                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                  current.winningRule === 'REACH_OR_PASS'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Reach or Pass (Sampai atau melepasi 100 menang)
              </button>
              <button
                type="button"
                onClick={() => setCurrent({ ...current, winningRule: 'EXACT' })}
                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                  current.winningRule === 'EXACT'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Exact Finish (Mesti baling dadu tepat ke 100)
              </button>
            </div>
          </div>

          {/* Default Wrong-Answer Penalty */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Denda Jawapan Salah / Wrong-Answer Penalty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCurrent({ ...current, penaltyRule: 'NO_MOVE' })}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                  current.penaltyRule === 'NO_MOVE'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Kekal Di Petak (No Move)
              </button>
              <button
                type="button"
                onClick={() => setCurrent({ ...current, penaltyRule: 'LOSE_TURN' })}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                  current.penaltyRule === 'LOSE_TURN'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Hilang Giliran Seterusnya
              </button>
              <button
                type="button"
                onClick={() => setCurrent({ ...current, penaltyRule: 'TEACHER_CHOICE' })}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                  current.penaltyRule === 'TEACHER_CHOICE'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Pilihan Guru
              </button>
            </div>
          </div>

          {/* Question Timer */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Masa Menjawab / Question Timer</span>
                <span className="text-xs text-slate-500">Masa berfikir untuk murid dalam kelas</span>
              </div>
            </div>
            <select
              value={current.questionTimerSeconds}
              onChange={(e) => setCurrent({ ...current, questionTimerSeconds: parseInt(e.target.value, 10) })}
              className="bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 cursor-pointer shadow-sm"
            >
              <option value={0}>Tiada Masa (Untimed)</option>
              <option value={15}>15 Saat</option>
              <option value={30}>30 Saat</option>
              <option value={45}>45 Saat</option>
              <option value={60}>60 Saat</option>
            </select>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Kurangkan Animasi (Reduced Motion)</span>
                <span className="text-xs text-slate-500">Untuk projektor atau perkakasan perlahan</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={current.reducedMotion}
                onChange={(e) => setCurrent({ ...current, reducedMotion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Batal / Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md transition active:scale-95"
          >
            Simpan Tetapan / Save
          </button>
        </div>
      </div>
    </div>
  );
};
