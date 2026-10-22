import React, { useState, useEffect } from 'react';
import { Question, Team, WrongAnswerPenalty } from '../types';
import { CheckCircle2, XCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  activeTeam: Team;
  diceRoll: number;
  timerSeconds: number;
  penaltyRule: WrongAnswerPenalty;
  selectedAnswer: string | null;
  isConfirmed: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (ans: string) => void;
  onConfirm: (overrideCorrect?: boolean, customPenalty?: WrongAnswerPenalty) => void;
  onAdvance: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  activeTeam,
  diceRoll,
  timerSeconds,
  penaltyRule,
  selectedAnswer,
  isConfirmed,
  isCorrect,
  onSelectAnswer,
  onConfirm,
  onAdvance,
}) => {
  const [shortAnswerInput, setShortAnswerInput] = useState<string>(selectedAnswer || '');
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
  const [timerRunning, setTimerRunning] = useState<boolean>(timerSeconds > 0);
  const [customPenalty, setCustomPenalty] = useState<WrongAnswerPenalty>('NO_MOVE');

  // Handle countdown timer if configured
  useEffect(() => {
    if (timerSeconds <= 0 || !timerRunning || isConfirmed) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, timerRunning, isConfirmed]);

  const handleShortAnswerChange = (val: string) => {
    setShortAnswerInput(val);
    onSelectAnswer(val);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'Hard':
        return 'text-rose-800 bg-rose-100 border-rose-300';
      default:
        return 'text-amber-800 bg-amber-100 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
              style={{ backgroundColor: activeTeam.color }}
            >
              {activeTeam.icon}
            </div>
            <div>
              <span className="text-xs uppercase font-black text-slate-500 block tracking-wider">
                SOALAN KUMPULAN &bull; {activeTeam.name}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-800">
                Petak Semasa {activeTeam.currentSquare} &rarr; Dadu Rolled {diceRoll} &rarr; Sasaran Petak {activeTeam.currentSquare + diceRoll}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {timerSeconds > 0 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-black tabular-nums ${
                  timeLeft <= 5
                    ? 'bg-rose-100 border-rose-400 text-rose-800 animate-pulse'
                    : 'bg-amber-100 border-amber-300 text-amber-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
            <span className={`px-3 py-1 text-xs font-black rounded-xl border ${getDifficultyBadge(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Content Body - Very Large Box */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Question Prompt - Big Box */}
          <div className="bg-amber-50/60 p-6 sm:p-8 rounded-3xl border-2 border-amber-200/90 shadow-sm">
            <span className="text-xs sm:text-sm font-black text-amber-700 uppercase tracking-widest block mb-2">
              {question.type === 'MCQ'
                ? 'SOALAN ANEKA PILIHAN (MCQ)'
                : question.type === 'TRUE_FALSE'
                ? 'SOALAN BENAR ATAU PALSU'
                : 'SOALAN JAWAPAN PENDEK'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-snug">
              {question.question}
            </h2>
          </div>

          {/* Answering Controls - Large Boxes */}
          {!isConfirmed ? (
            <div>
              {/* MCQ Options - Large Cards */}
              {question.type === 'MCQ' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {question.options.map((opt) => {
                    const isSelected = selectedAnswer === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => onSelectAnswer(opt.label)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 shadow-lg ring-3 ring-amber-400/50 scale-[1.02]'
                            : 'bg-slate-50 border-slate-200 hover:bg-amber-50/40 hover:border-amber-300'
                        }`}
                      >
                        <span
                          className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-black text-lg ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-white text-slate-700 border-2 border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-slate-900">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False Buttons - Extra Large */}
              {question.type === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-5">
                  {['TRUE', 'FALSE'].map((choice) => {
                    const isSelected = selectedAnswer === choice;
                    const isTrue = choice === 'TRUE';
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => onSelectAnswer(choice)}
                        className={`py-8 sm:py-10 px-6 rounded-3xl border-3 text-center transition-all cursor-pointer ${
                          isSelected
                            ? isTrue
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-4 ring-emerald-400/50 scale-[1.02]'
                              : 'bg-rose-100 border-rose-500 text-rose-900 ring-4 ring-rose-400/50 scale-[1.02]'
                            : isTrue
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-rose-50/60 border-rose-300 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        <span className="text-3xl sm:text-4xl font-black tracking-wide block">
                          {isTrue ? '✓ BENAR' : '✗ PALSU'}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 block">
                          {isTrue ? '(TRUE)' : '(FALSE)'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer Input - Extra Large Field */}
              {question.type === 'SHORT_ANSWER' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Guru: Masukkan jawapan murid di bawah (atau klik override betul/salah):
                    </label>
                    <input
                      type="text"
                      value={shortAnswerInput}
                      onChange={(e) => handleShortAnswerChange(e.target.value)}
                      placeholder="Taip jawapan kumpulan di sini..."
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xl sm:text-2xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    Sistem akan menyemak jawapan ini secara automatik apabila anda menekan butang Sahkan Jawapan.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Post-Confirmation Result & Explanation - Large Box */
            <div className="space-y-5">
              <div
                className={`p-6 sm:p-8 rounded-3xl border-3 flex items-start gap-5 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-rose-50 border-rose-400 text-rose-950'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-12 h-12 text-rose-600 shrink-0 mt-1" />
                )}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {isCorrect ? 'TAHNIAH, JAWAPAN BETUL!' : 'MAAF, JAWAPAN KURANG TEPAT'}
                  </h3>
                  <div className="text-base sm:text-lg mt-2">
                    <span className="font-bold text-slate-700">Jawapan Sebenar: </span>
                    <span className="font-black text-amber-700 text-xl sm:text-2xl ml-1">
                      {question.type === 'MCQ'
                        ? `${question.correctAnswer}. ${
                            question.options.find((o) => o.label === question.correctAnswer)?.text || ''
                          }`
                        : question.correctAnswer}
                    </span>
                  </div>
                  {question.type === 'SHORT_ANSWER' && question.acceptedAnswers && question.acceptedAnswers.length > 0 && (
                    <div className="text-xs sm:text-sm text-slate-600 mt-1">
                      Jawapan lain yang turut diterima: {question.acceptedAnswers.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation Box */}
              {question.explanation && (
                <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Penerangan Guru</span>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Movement Preview */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between text-sm sm:text-base">
                <span className="text-slate-600 font-bold">Tindakan Selepas Ini:</span>
                <span className="font-black text-slate-900">
                  {isCorrect
                    ? `Maju ${diceRoll} langkah ke Petak ${activeTeam.currentSquare + diceRoll}`
                    : penaltyRule === 'LOSE_TURN'
                    ? 'Kekal di petak dan hilang giliran seterusnya'
                    : 'Kekal di petak semasa (tiada pergerakan)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t-2 border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {!isConfirmed ? (
            <>
              {/* Teacher Overrides */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onConfirm(true)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-900 border-2 border-emerald-300 hover:bg-emerald-200 cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Guru: Tandakan BETUL</span>
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-100 text-rose-900 border-2 border-rose-300 hover:bg-rose-200 cursor-pointer transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Guru: Tandakan SALAH</span>
                </button>
              </div>

              {/* Primary Confirm Button */}
              <button
                type="button"
                onClick={() => onConfirm()}
                disabled={!selectedAnswer && question.type !== 'SHORT_ANSWER'}
                className={`px-8 py-3.5 rounded-2xl font-black text-base tracking-wide shadow-lg cursor-pointer transition ${
                  !selectedAnswer && question.type !== 'SHORT_ANSWER'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 active:scale-95 ring-2 ring-amber-400'
                }`}
              >
                Sahkan Jawapan &amp; Dedahkan
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {penaltyRule === 'TEACHER_CHOICE' && !isCorrect && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
                  <span>Denda:</span>
                  <select
                    value={customPenalty}
                    onChange={(e) => setCustomPenalty(e.target.value as WrongAnswerPenalty)}
                    className="bg-white border-2 border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold"
                  >
                    <option value="NO_MOVE">Kekal di Petak (Tiada Pergerakan)</option>
                    <option value="LOSE_TURN">Hilang Giliran Seterusnya</option>
                  </select>
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={onAdvance}
                  className="px-8 py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg cursor-pointer active:scale-95 transition flex items-center gap-2 ring-2 ring-amber-400"
                >
                  <span>Gerakkan Token &amp; Giliran Seterusnya</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
