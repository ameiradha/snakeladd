import React, { useState } from 'react';
import { Quiz } from '../types';
import {
  Search,
  Plus,
  Play,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Download,
  Filter,
  Sparkles,
  FileText,
  Calendar,
  BookOpen,
} from 'lucide-react';

interface QuizLibraryProps {
  quizzes: Quiz[];
  onSelectPlayQuiz: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDuplicateQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onCreateNewQuiz: () => void;
  onOpenAIGenerator: () => void;
  onOpenTextImporter: () => void;
  onExportQuizJSON: (quiz: Quiz) => void;
}

export const QuizLibrary: React.FC<QuizLibraryProps> = ({
  quizzes,
  onSelectPlayQuiz,
  onEditQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
  onCreateNewQuiz,
  onOpenAIGenerator,
  onOpenTextImporter,
  onExportQuizJSON,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'questions'>('date');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  // Derive subjects & years
  const subjects = Array.from(new Set(quizzes.map((q) => q.subject))).filter(Boolean);
  const years = Array.from(new Set(quizzes.map((q) => q.yearLevel))).filter(Boolean);

  const filteredQuizzes = quizzes
    .filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchYear = selectedYear === 'ALL' || q.yearLevel === selectedYear;
      return matchSearch && matchSubject && matchYear;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.updatedAt - a.updatedAt;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return b.questions.length - a.questions.length;
    });

  const handleDeleteConfirm = (quiz: Quiz) => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
      onDeleteQuiz(quiz.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner and Creation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Koleksi Kuiz / Quiz Library
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Urus koleksi kuiz bilik darjah anda, import soalan teks, atau jana soalan automatik dengan AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Jana dengan AI</span>
          </button>
          <button
            type="button"
            onClick={onOpenTextImporter}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Import Teks</span>
          </button>
          <button
            type="button"
            onClick={onCreateNewQuiz}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cipta Kuiz Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kuiz mengikut tajuk, topik, atau subjek..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Mata Pelajaran</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Tahun/Gred</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="date">Susun: Terkini Diubah</option>
            <option value="name">Susun: Nama (A-Z)</option>
            <option value="questions">Susun: Bilangan Soalan</option>
          </select>
        </div>
      </div>

      {/* Quiz Cards Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">Tiada kuiz bertepatan carian anda</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuba ubah kata kunci carian, cipta kuiz baru secara manual, atau guna jana automatik dengan AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg group"
            >
              <div className="space-y-2.5">
                {/* Subject & Year header metadata */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {quiz.subject}
                  </span>
                  <span aria-hidden="true">&bull;</span>
                  <span>{quiz.yearLevel}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>{quiz.language}</span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition line-clamp-2">
                  {quiz.title}
                </h3>

                {quiz.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {quiz.description}
                  </p>
                )}

                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between font-semibold">
                  <span className="font-bold text-slate-700">{quiz.questions.length} Soalan</span>
                  <span>{new Date(quiz.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectPlayQuiz(quiz)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Main Kuiz</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewQuiz(quiz)}
                    title="Pratonton Soalan"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditQuiz(quiz)}
                    title="Edit Kuiz"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateQuiz(quiz)}
                    title="Salin Kuiz"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onExportQuizJSON(quiz)}
                    title="Eksport JSON"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteConfirm(quiz)}
                    title="Padam Kuiz"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{previewQuiz.title}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {previewQuiz.subject} &bull; {previewQuiz.yearLevel} &bull; {previewQuiz.questions.length} Soalan
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuiz(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Tutup / Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewQuiz.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-black text-amber-700">Soalan #{idx + 1} &bull; {q.type}</span>
                    <span className="font-bold">{q.difficulty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>

                  {q.type === 'MCQ' && (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.label}
                          className={`p-2 rounded-lg border-2 ${
                            q.correctAnswer === opt.label
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.label}. {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs pt-1">
                    <span className="text-slate-500 font-semibold">Jawapan Betul: </span>
                    <span className="font-black text-emerald-700">{q.correctAnswer}</span>
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const q = previewQuiz;
                  setPreviewQuiz(null);
                  onSelectPlayQuiz(q);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md"
              >
                Gunakan Kuiz Ini Untuk Permainan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
