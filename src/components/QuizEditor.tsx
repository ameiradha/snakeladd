import React, { useState } from 'react';
import { Quiz, Question, QuestionType, Difficulty } from '../types';
import { Plus, Trash2, Save, ArrowLeft, HelpCircle } from 'lucide-react';

interface QuizEditorProps {
  initialQuiz?: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ initialQuiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [subject, setSubject] = useState(initialQuiz?.subject || 'Science');
  const [yearLevel, setYearLevel] = useState(initialQuiz?.yearLevel || 'Year 4');
  const [topic, setTopic] = useState(initialQuiz?.topic || '');
  const [language, setLanguage] = useState<'English' | 'Bahasa Melayu'>(
    (initialQuiz?.language as any) || 'English'
  );
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz?.questions || [
      {
        id: `q_${Date.now()}_1`,
        question: 'Which planet is closest to the Sun?',
        type: 'MCQ',
        options: [
          { label: 'A', text: 'Venus' },
          { label: 'B', text: 'Mercury' },
          { label: 'C', text: 'Mars' },
          { label: 'D', text: 'Jupiter' },
        ],
        correctAnswer: 'B',
        explanation: 'Mercury is the innermost planet of the Solar System.',
        difficulty: 'Easy',
      },
    ]
  );

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      question: '',
      type: 'MCQ',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correctAnswer: 'A',
      acceptedAnswers: [],
      explanation: '',
      difficulty: 'Medium',
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please provide a title for the quiz.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    // Validate that questions have text and answers
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question #${i + 1} is missing its question text.`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        alert(`Question #${i + 1} is missing its correct answer.`);
        return;
      }
      if (q.type === 'MCQ') {
        const emptyOpt = q.options.find((o) => !o.text.trim());
        if (emptyOpt) {
          alert(`Question #${i + 1} has an empty option for label ${emptyOpt.label}.`);
          return;
        }
      }
    }

    const savedQuiz: Quiz = {
      id: initialQuiz?.id || `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subject: subject.trim(),
      yearLevel: yearLevel.trim(),
      topic: topic.trim() || title.trim(),
      language,
      description: description.trim(),
      questions,
      createdAt: initialQuiz?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(savedQuiz);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Koleksi</span>
        </button>

        <h2 className="text-xl font-black text-slate-900">
          {initialQuiz ? 'Edit Kuiz' : 'Cipta Kuiz Baru'}
        </h2>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Kuiz</span>
        </button>
      </div>

      {/* Quiz Metadata Fields */}
      <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Tajuk Kuiz (Quiz Title) *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth. Sains Tahun 4: Sistem Suria & Planet"
            className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-extrabold text-base focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Mata Pelajaran (Subject)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="cth. Sains"
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Tahun / Gred (Year Level)</label>
            <input
              type="text"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              placeholder="cth. Tahun 4"
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Topik (Topic)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="cth. Elektrik"
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Bahasa (Language)</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
            >
              <option value="English">English</option>
              <option value="Bahasa Melayu">Bahasa Melayu</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Penerangan / Nota Guru (Pilihan)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nota ringkas untuk panduan kelas..."
            className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>Senarai Soalan ({questions.length})</span>
          </h3>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Tambah Soalan</span>
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-4 relative shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                  Soalan #{idx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      let newCorrect = q.correctAnswer;
                      if (newType === 'TRUE_FALSE') newCorrect = 'TRUE';
                      if (newType === 'MCQ' && !['A', 'B', 'C', 'D'].includes(newCorrect)) newCorrect = 'A';
                      handleUpdateQuestion(idx, { type: newType, correctAnswer: newCorrect });
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold"
                  >
                    <option value="MCQ">Aneka Pilihan (MCQ)</option>
                    <option value="TRUE_FALSE">Benar atau Palsu</option>
                    <option value="SHORT_ANSWER">Jawapan Pendek</option>
                  </select>

                  <select
                    value={q.difficulty}
                    onChange={(e) => handleUpdateQuestion(idx, { difficulty: e.target.value as Difficulty })}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold"
                  >
                    <option value="Easy">Mudah</option>
                    <option value="Medium">Sederhana</option>
                    <option value="Hard">Sukar</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Padam soalan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                  placeholder="Masukkan teks soalan di sini..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* MCQ Options */}
              {q.type === 'MCQ' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">
                    Pilihan Jawapan (Tandakan radio untuk jawapan yang betul):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.label} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${q.id}_${idx}`}
                          checked={q.correctAnswer === opt.label}
                          onChange={() => handleUpdateQuestion(idx, { correctAnswer: opt.label })}
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                          title="Tandakan sebagai jawapan betul"
                        />
                        <span className="text-xs font-black text-slate-700 w-4">{opt.label}:</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                            handleUpdateQuestion(idx, { options: newOpts });
                          }}
                          placeholder={`Pilihan ${opt.label}`}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* True/False selection */}
              {q.type === 'TRUE_FALSE' && (
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-slate-600">Jawapan Betul:</span>
                  <label className="flex items-center gap-1.5 text-emerald-700 cursor-pointer">
                    <input
                      type="radio"
                      name={`tf_${q.id}_${idx}`}
                      checked={q.correctAnswer === 'TRUE'}
                      onChange={() => handleUpdateQuestion(idx, { correctAnswer: 'TRUE' })}
                      className="accent-emerald-600"
                    />
                    <span>BENAR (TRUE)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-rose-700 cursor-pointer">
                    <input
                      type="radio"
                      name={`tf_${q.id}_${idx}`}
                      checked={q.correctAnswer === 'FALSE'}
                      onChange={() => handleUpdateQuestion(idx, { correctAnswer: 'FALSE' })}
                      className="accent-rose-600"
                    />
                    <span>PALSU (FALSE)</span>
                  </label>
                </div>
              )}

              {/* Short Answer */}
              {q.type === 'SHORT_ANSWER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Jawapan Utama Tepat *
                    </label>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => handleUpdateQuestion(idx, { correctAnswer: e.target.value })}
                      placeholder="cth. Jantung / 20"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-emerald-700 font-black focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Variasi Jawapan Lain Diterima (asingkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={(q.acceptedAnswers || []).join(', ')}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, {
                          acceptedAnswers: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="cth. heart, organ jantung"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Penerangan Jawapan (Pedagogical Explanation):
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                  placeholder="Mengapa jawapan ini betul untuk penerangan murid..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
