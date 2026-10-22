import React, { useState } from 'react';
import { Team } from '../types';
import { AVAILABLE_TEAM_ICONS, AVAILABLE_TEAM_COLORS, PRESET_ALL_TEAMS } from '../game/constants';
import { Plus, Trash2, ArrowUp, ArrowDown, Users, Check } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  onTeamsChange: (teams: Team[]) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamsChange }) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Quick preset team counts (starting from 2)
  const quickCounts = [2, 3, 4, 5, 6, 8, 10, 12];

  const handleSelectCount = (count: number) => {
    if (count < 2) count = 2;
    if (count <= PRESET_ALL_TEAMS.length) {
      onTeamsChange(PRESET_ALL_TEAMS.slice(0, count));
    } else {
      const result = [...PRESET_ALL_TEAMS];
      while (result.length < count) {
        const nextNum = result.length + 1;
        const colorIndex = (nextNum - 1) % AVAILABLE_TEAM_COLORS.length;
        const iconIndex = (nextNum - 1) % AVAILABLE_TEAM_ICONS.length;
        result.push({
          id: `team_${Date.now()}_${nextNum}`,
          name: `Team ${nextNum}`,
          color: AVAILABLE_TEAM_COLORS[colorIndex],
          icon: AVAILABLE_TEAM_ICONS[iconIndex],
          members: [],
          currentSquare: 1,
          correctCount: 0,
          incorrectCount: 0,
          attemptsCount: 0,
          skippedTurns: 0,
        });
      }
      onTeamsChange(result);
    }
  };

  const handleAddTeam = () => {
    const nextNum = teams.length + 1;
    const colorIndex = (nextNum - 1) % AVAILABLE_TEAM_COLORS.length;
    const iconIndex = (nextNum - 1) % AVAILABLE_TEAM_ICONS.length;

    const newTeam: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Team ${nextNum}`,
      color: AVAILABLE_TEAM_COLORS[colorIndex],
      icon: AVAILABLE_TEAM_ICONS[iconIndex],
      members: [],
      currentSquare: 1,
      correctCount: 0,
      incorrectCount: 0,
      attemptsCount: 0,
      skippedTurns: 0,
    };

    onTeamsChange([...teams, newTeam]);
    setEditingTeamId(newTeam.id);
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) {
      alert('Sekurang-kurangnya 2 kumpulan diperlukan untuk bermain.');
      return;
    }
    onTeamsChange(teams.filter((t) => t.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onTeamsChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= teams.length - 1) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onTeamsChange(updated);
  };

  const handleUpdateTeam = (id: string, updates: Partial<Team>) => {
    onTeamsChange(teams.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Konfigurasi Kumpulan Murid ({teams.length} Kumpulan Aktif)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pilih bilangan kumpulan (bermula dari 2 kumpulan) atau sesuaikan nama dan warna murid.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTeam}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kumpulan</span>
        </button>
      </div>

      {/* Quick Group Presets Selector - Starts from 2 */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
          Pilihan Pantas Bilangan Kumpulan (Bermula Dari 2 Kumpulan):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {quickCounts.map((count) => {
            const isSelected = teams.length === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => handleSelectCount(count)}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-100 hover:border-amber-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{count} Kumpulan</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
        {teams.map((team, index) => {
          const isEditing = editingTeamId === team.id;

          return (
            <div
              key={team.id}
              className={`p-4 rounded-2xl border transition-all ${
                isEditing
                  ? 'bg-amber-50/40 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Token Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-md cursor-pointer hover:scale-105 transition"
                    style={{ backgroundColor: team.color }}
                    onClick={() => setEditingTeamId(isEditing ? null : team.id)}
                    title="Klik untuk tukar warna & ikon"
                  >
                    {team.icon}
                  </div>

                  {/* Name & Members */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleUpdateTeam(team.id, { name: e.target.value })}
                      placeholder="Nama Kumpulan"
                      className="w-full bg-transparent font-extrabold text-base text-slate-900 placeholder-slate-400 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={(team.members || []).join(', ')}
                      onChange={(e) =>
                        handleUpdateTeam(team.id, {
                          members: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Nama murid: Adam, Siti, Rayyan..."
                      className="w-full bg-transparent text-xs text-slate-600 placeholder-slate-400 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none truncate mt-0.5"
                    />
                  </div>
                </div>

                {/* Team Controls: Order & Remove */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Naikkan giliran"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Turunkan giliran"
                    disabled={index === teams.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Padam kumpulan"
                    disabled={teams.length <= 2}
                    onClick={() => handleRemoveTeam(team.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Color and Icon Picker Drawer when active */}
              {isEditing && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Pilih Warna Kumpulan:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TEAM_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateTeam(team.id, { color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer shadow-sm ${
                            team.color === c ? 'scale-125 ring-2 ring-slate-800' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Pilih Ikon Maskot:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                      {AVAILABLE_TEAM_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleUpdateTeam(team.id, { icon })}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                            team.icon === icon
                              ? 'bg-amber-200 text-slate-950 font-bold scale-110 shadow-sm'
                              : 'hover:bg-slate-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
