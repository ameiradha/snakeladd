import React, { useState } from 'react';
import { Quiz, GameRecord, GameSettings, ExportData } from '../types';
import { dbService } from '../services/db';
import { Download, Upload, CheckCircle2, AlertTriangle, FileJson, X } from 'lucide-react';

interface JSONBackupModalProps {
  onClose: () => void;
  onRefreshData: () => void;
}

export const CURRENT_SCHEMA_VERSION = '1.0';

export const JSONBackupModal: React.FC<JSONBackupModalProps> = ({ onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importPreview, setImportPreview] = useState<{
    quizzesCount: number;
    historyCount: number;
    hasSettings: boolean;
    data: ExportData;
  } | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'copy' | 'skip' | 'replace'>('copy');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Full or Partial Export
  const handleExport = async (type: 'all' | 'quizzes' | 'history' | 'settings') => {
    try {
      const quizzes = await dbService.getAllQuizzes();
      const history = await dbService.getGameHistory();
      const settings = await dbService.getSettings();

      const exportObj: ExportData = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
      };

      if (type === 'all' || type === 'quizzes') exportObj.quizzes = quizzes;
      if (type === 'all' || type === 'history') exportObj.gameHistory = history;
      if (type === 'all' || type === 'settings') exportObj.settings = settings;

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz_arena_backup_${type}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: `Successfully exported ${type} backup file!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to create export file.' });
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    setImportPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('File content is not a valid JSON object.');
        }

        if (parsed.schemaVersion && parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
          // Warning for version mismatch
          console.warn(`Version warning: file is version ${parsed.schemaVersion}`);
        }

        const quizzesCount = Array.isArray(parsed.quizzes) ? parsed.quizzes.length : 0;
        const historyCount = Array.isArray(parsed.gameHistory) ? parsed.gameHistory.length : 0;
        const hasSettings = Boolean(parsed.settings);

        if (quizzesCount === 0 && historyCount === 0 && !hasSettings) {
          throw new Error('No recognized Quiz Arena data found in file.');
        }

        setImportPreview({
          quizzesCount,
          historyCount,
          hasSettings,
          data: parsed,
        });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Malformed JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  // Execute Import with Conflict Strategy
  const handleExecuteImport = async () => {
    if (!importPreview) return;
    try {
      const { data } = importPreview;
      const existingQuizzes = await dbService.getAllQuizzes();
      const existingIds = new Set(existingQuizzes.map((q) => q.id));

      if (Array.isArray(data.quizzes)) {
        for (const quiz of data.quizzes) {
          if (!quiz.id || !quiz.title || !Array.isArray(quiz.questions)) continue;

          if (existingIds.has(quiz.id)) {
            if (duplicateStrategy === 'skip') {
              continue;
            } else if (duplicateStrategy === 'copy') {
              const copyQuiz: Quiz = {
                ...quiz,
                id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: `${quiz.title} (Copy)`,
                updatedAt: Date.now(),
              };
              await dbService.saveQuiz(copyQuiz);
            } else if (duplicateStrategy === 'replace') {
              await dbService.saveQuiz(quiz);
            }
          } else {
            await dbService.saveQuiz(quiz);
          }
        }
      }

      if (Array.isArray(data.gameHistory)) {
        for (const record of data.gameHistory) {
          if (record.id && record.quizTitle) {
            await dbService.saveGameRecord(record);
          }
        }
      }

      if (data.settings) {
        await dbService.saveSettings(data.settings);
      }

      setStatusMessage({ type: 'success', text: 'Backup imported successfully into local storage!' });
      setImportPreview(null);
      onRefreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Error importing backup data.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">Sandaran &amp; Pulih JSON / Backup &amp; Restore</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-600 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Eksport Sandaran (Export)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'import'
                ? 'border-amber-500 text-amber-600 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Import Sandaran (Restore)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Simpan salinan kuiz, rekod perlawanan, dan tetapan kelas anda ke fail JSON standard secara setempat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleExport('all')}
                  className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-500 text-left transition cursor-pointer group shadow-sm hover:bg-amber-50/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700">
                      Semua Data (Lengkap)
                    </span>
                    <Download className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Termasuk kuiz, rekod permainan, dan tetapan aplikasi.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('quizzes')}
                  className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-500 text-left transition cursor-pointer group shadow-sm hover:bg-amber-50/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700">
                      Koleksi Kuiz Sahaja
                    </span>
                    <Download className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Eksport soalan dan set soalan yang disimpan.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('history')}
                  className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-500 text-left transition cursor-pointer group shadow-sm hover:bg-amber-50/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700">
                      Rekod Permainan Sahaja
                    </span>
                    <Download className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Eksport log markah dan keputusan terdahulu.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('settings')}
                  className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-500 text-left transition cursor-pointer group shadow-sm hover:bg-amber-50/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700">
                      Konfigurasi Tetapan
                    </span>
                    <Download className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Eksport pilihan bahasa, bunyi, dan format bilik darjah.
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Pulihkan kuiz atau data daripada fail sandaran JSON yang telah dieksport sebelum ini.
              </p>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-amber-500 bg-slate-50 transition">
                <input
                  type="file"
                  id="backup-file-input"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="backup-file-input"
                  className="flex flex-col items-center justify-center cursor-pointer gap-2"
                >
                  <Upload className="w-8 h-8 text-amber-500" />
                  <span className="text-sm font-extrabold text-slate-900">Pilih Fail Sandaran JSON</span>
                  <span className="text-xs text-slate-500">Menyokong format fail .json</span>
                </label>
              </div>

              {/* Import Preview */}
              {importPreview && (
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider">
                    Pratonton Kandungan Fail
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <span className="block font-black text-slate-900 text-base">{importPreview.quizzesCount}</span>
                      <span className="text-slate-500 text-[11px] font-bold">Kuiz</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <span className="block font-black text-slate-900 text-base">{importPreview.historyCount}</span>
                      <span className="text-slate-500 text-[11px] font-bold">Rekod Permainan</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <span className="block font-black text-slate-900 text-base">
                        {importPreview.hasSettings ? 'Ya' : 'Tidak'}
                      </span>
                      <span className="text-slate-500 text-[11px] font-bold">Tetapan</span>
                    </div>
                  </div>

                  {/* Duplicate Strategy */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Sekiranya ID Sudah Wujud:
                    </label>
                    <select
                      value={duplicateStrategy}
                      onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 shadow-sm"
                    >
                      <option value="copy">Import sebagai salinan baru (Selamat)</option>
                      <option value="skip">Langkau yang sudah ada (Kekalkan sedia ada)</option>
                      <option value="replace">Gantikan kuiz sedia ada</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="w-full py-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-md"
                  >
                    Sahkan &amp; Import Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
