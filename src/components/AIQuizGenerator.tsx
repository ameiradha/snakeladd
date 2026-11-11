import React, { useState, useEffect } from 'react';
import { Quiz, Question, Difficulty } from '../types';
import { checkAIStatus, requestAIGenerateQuiz, AIStatusResponse } from '../services/ai';
import { Sparkles, Loader2, AlertCircle, Trash2, Save, User as UserIcon, Lock } from 'lucide-react';
import { auth, loginWithGoogle } from '../services/firebaseService';

interface AIQuizGeneratorProps {
  onSaveQuiz: (quiz: Quiz) => void;
  onCancel: () => void;
  currentUserEmail?: string | null;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({
  onSaveQuiz,
  onCancel,
  currentUserEmail,
}) => {
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Simplified form fields: Subject, Year Level, Topic, and Curriculum Code are removed as requested!
  const [promptDescription, setPromptDescription] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<'English' | 'Bahasa Melayu'>('Bahasa Melayu');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionType, setQuestionType] = useState<'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED'>('MIXED');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeAlternatives, setIncludeAlternatives] = useState(true);

  // User auth state
  const [user, setUser] = useState(auth.currentUser);

  // Execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [usedModel, setUsedModel] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    checkAIStatus()
      .then((res) => {
        setAiStatus(res);
        setLoadingStatus(false);
      })
      .catch(() => {
        setAiStatus({
          available: false,
          model: 'gemini-3.8-flash',
          message: 'Unable to contact AI status endpoint.',
        });
        setLoadingStatus(false);
      });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
    } catch (err: any) {
      alert('Gagal log masuk: ' + (err.message || String(err)));
    }
  };

  const handleGenerate = async () => {
    if (!promptDescription.trim() && !title.trim()) {
      setErrorMessage('Sila masukkan arahan atau tajuk soalan yang ingin anda jana.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await requestAIGenerateQuiz({
        promptDescription,
        title: title.trim(),
        language,
        count,
        difficulty,
        questionType,
        includeExplanations: false,
        includeAlternatives,
      });

      setGeneratedQuestions(result.questions);
      setQuizTitle(result.title || title.trim() || 'Kuiz Snake Ladd');
      if (result.meta?.model) {
        setUsedModel(result.meta.model);
      }
      setIsReviewing(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menjana kuiz. Sila cuba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], ...updates };
    setGeneratedQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
  };

  const handleSaveToLibrary = () => {
    if (generatedQuestions.length === 0) {
      alert('Tidak boleh menyimpan kuiz kosong. Sila jana atau simpan sekurang-kurangnya satu soalan.');
      return;
    }

    const effectiveEmail = user?.email || currentUserEmail || undefined;
    const effectiveUserId = user?.uid || undefined;

    const newQuiz: Quiz = {
      id: `quiz_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: quizTitle || title.trim() || 'Kuiz AI Peribadi',
      language,
      description: promptDescription || 'Dijana oleh AI untuk kegunaan peribadi.',
      questions: generatedQuestions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: effectiveUserId,
      userEmail: effectiveEmail,
      isPrivate: true, // Strictly private for this logged in email
    };

    onSaveQuiz(newQuiz);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {isReviewing ? 'Semak Kuiz Dijana AI (Review)' : 'Penjana Kuiz Berkuasa AI / AI Quiz Generator'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Tutup / Close
          </button>
        </div>

        {/* Private Privacy Status Banner */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="font-black text-xs block">
                Privasi Soalan: Hak Milik Peribadi ({user?.email || currentUserEmail || 'Belum Log Masuk'})
              </span>
              <span className="text-[11px] text-sky-700">
                {user?.email || currentUserEmail
                  ? 'Soalan yang dijana disimpan secara peribadi (Private) dan hanya boleh digunapakai oleh emel anda sahaja.'
                  : 'Sila log masuk akaun Google/Emel anda supaya soalan ini dikunci eksklusif untuk emel anda.'}
              </span>
            </div>
          </div>
          {!user && (
            <button
              type="button"
              onClick={handleLogin}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Log Masuk Emel</span>
            </button>
          )}
        </div>

        {/* AI Service Status Notification */}
        {!isReviewing && aiStatus && !aiStatus.available && (
          <div className="mx-6 mt-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-sm">Konfigurasi GEMINI_API_KEY</span>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                {aiStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isReviewing ? (
            /* Generator Form - Simplified (No Subject, No Year, No Topic, No Curriculum Code) */
            <div className="space-y-4">
              {/* Natural Language Prompt */}
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                  Arahan atau Kandungan Kuiz / Prompt *:
                </label>
                <textarea
                  value={promptDescription}
                  onChange={(e) => setPromptDescription(e.target.value)}
                  placeholder='Masukkan topik apa sahaja yang anda inginkan, cth: "Jana soalan tentang keselamatan di jalan raya untuk murid sekolah", atau "Soalan peribahasa melayu berserta maksud", atau "Sains tentang kitaran air dan awan".'
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Title (Optional override) */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Tajuk Kuiz (Pilihan - Jika dikosongkan, AI akan jana automatik):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth. Kuiz Ulangkaji Ceria 2026"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Grid Form Fields: Language, Count, Difficulty, Question Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bahasa (Language)</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Bahasa Melayu">Bahasa Melayu</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Bilangan Soalan: ({count})
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    step={1}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tahap Kesukaran (Difficulty)</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Easy">Mudah (Easy)</option>
                    <option value="Medium">Sederhana (Medium)</option>
                    <option value="Hard">Mencabar (Hard)</option>
                    <option value="Mixed">Campuran (Mixed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jenis Soalan (Question Type)</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="MIXED">Campuran (MCQ, Betul/Salah, Jawapan Pendek)</option>
                    <option value="MCQ">Aneka Pilihan Sahaja (MCQ)</option>
                    <option value="TRUE_FALSE">Benar atau Palsu Sahaja</option>
                    <option value="SHORT_ANSWER">Jawapan Pendek Sahaja</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAlternatives}
                    onChange={(e) => setIncludeAlternatives(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                  <span>Sertakan variasi jawapan yang diterima untuk soalan pendek</span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-800">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            /* Review & Edit Screen */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="text-lg font-black text-slate-900 bg-white border-b-2 border-amber-500 focus:outline-none py-1 flex-1 mr-4"
                />
                <div className="flex items-center gap-2 shrink-0">
                  {usedModel && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      ⚡ Model: {usedModel}
                    </span>
                  )}
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {generatedQuestions.length} Soalan Dijana
                  </span>
                </div>
              </div>

              {/* List of reviewable questions */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {generatedQuestions.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black text-slate-500 uppercase">
                            Soalan {qIndex + 1} &bull; {q.type} &bull; {q.difficulty}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIndex, { question: e.target.value })}
                          className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIndex)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Padam soalan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* MCQ Options */}
                    {q.type === 'MCQ' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIndex) => (
                          <div key={opt.label} className="flex items-center gap-1.5">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center font-black ${
                                q.correctAnswer === opt.label
                                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[oIndex] = { ...newOpts[oIndex], text: e.target.value };
                                handleUpdateQuestion(qIndex, { options: newOpts });
                              }}
                              className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer */}
                    <div className="pt-1 text-xs">
                      <div>
                        <span className="text-slate-600 font-bold block mb-0.5">Jawapan Betul:</span>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={(e) => handleUpdateQuestion(qIndex, { correctAnswer: e.target.value, explanation: '' })}
                          className="w-full sm:w-1/2 bg-white border border-slate-300 rounded px-2.5 py-1 text-emerald-700 font-black focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {isReviewing ? (
            <>
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                &larr; Kembali ke Borang
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan ke Koleksi Kuiz Peribadi</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal / Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2 ${
                  isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Menjana Soalan Menggunakan AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Jana Kuiz Sekarang</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
